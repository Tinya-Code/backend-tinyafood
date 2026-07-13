import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';
import { DatabaseException } from '../../common/errors/exceptions';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private connection!: mysql.Pool;
  private readonly logger = new Logger(DatabaseService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private isHealthy = true;
  private circuitBreakerOpen = false;
  private circuitBreakerTimeout = 30000; // 30 seconds
  private lastFailureTime: number = 0;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // IMPORTANT: This block must NEVER throw — any uncaught error here crashes
    // the entire process because NestJS propagates onModuleInit rejections.
    try {
      await this.connectWithRetry();
    } catch (error) {
      // Swallow the error so the app keeps running without DB.
      // Endpoints that need the DB will return a properly formatted 500 error
      // through DatabaseException → HttpExceptionFilter.
      this.isHealthy = false;
      try {
        this.logger.warn(
          `[DatabaseService] Could not connect to database on startup: ${
            (error as Error).message
          }. The app will continue — DB-dependent routes will return a service error.`,
        );
      } catch {
        // Logger itself could fail during early init — ignore completely.
      }
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    const hostRaw = this.configService.get<string>('DB_HOST') || 'localhost';
    const [host, portStr] = hostRaw.includes(':')
      ? hostRaw.split(':')
      : [hostRaw, String(this.configService.get<number>('DB_PORT') || 3306)];
    const port = parseInt(portStr, 10) || 3306;
    const username =
      this.configService.get<string>('DB_USERNAME') ||
      this.configService.get<string>('DB_USER') ||
      'root';
    const password = this.configService.get<string>('DB_PASSWORD') || '';
    const database =
      this.configService.get<string>('DB_DATABASE') || 'tinyafood';
    const charset = this.configService.get<string>('DB_CHARSET') || 'utf8mb4';

    let pool: mysql.Pool | null = null;

    try {
      pool = mysql.createPool({
        host,
        port,
        user: username,
        password,
        database,
        charset,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // CRITICAL: Attach an 'error' listener BEFORE testing the connection.
      // MySQL2 pools emit 'error' events on connection failures. Without a
      // listener, Node.js treats these as uncaught exceptions and crashes the
      // entire process — even when the caller has a try-catch.
      //
      // Note: mysql2/promise Pool types only declare on('enqueue',...), but the
      // runtime pool DOES extend EventEmitter and emits 'error'. We cast to
      // bypass the type limitation.
      (pool as unknown as NodeJS.EventEmitter).on('error', (err: Error) => {
        this.logger.error(`Database pool error: ${err.message}`);
        this.isHealthy = false;
        this.recordFailure();
      });

      // Test the connection
      const testConnection = await pool.getConnection();
      this.logger.log('Database connected successfully');
      testConnection.release();

      this.connection = pool;
      this.isHealthy = true;
      this.circuitBreakerOpen = false;

      // Auto-seed if the database is empty
      await this.autoSeed();
    } catch (error) {
      this.logger.error(
        `Database connection failed: ${(error as Error).message}`,
      );
      this.isHealthy = false;

      // Destroy the failed pool so it stops trying to reconnect and emitting
      // error events that could crash the process.
      if (pool) {
        try {
          await pool.end();
        } catch {
          /* ignore cleanup errors */
        }
      }

      throw error;
    }
  }

  private async connectWithRetry() {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.connect();
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `Database connection attempt ${attempt}/${this.maxRetries} failed`,
          error,
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          this.logger.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new DatabaseException(
      'Failed to connect to database after multiple attempts',
      lastError?.message,
    );
  }

  private async disconnect() {
    if (this.connection) {
      try {
        await this.connection.end();
        this.logger.log('Database connection closed');
      } catch (error) {
        this.logger.error('Error closing database connection:', error);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private checkCircuitBreaker(): void {
    if (this.circuitBreakerOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.circuitBreakerTimeout) {
        this.logger.log('Circuit breaker attempting to close');
        this.circuitBreakerOpen = false;
      } else {
        throw new DatabaseException(
          'Database service temporarily unavailable (circuit breaker open)',
        );
      }
    }
  }

  private recordFailure(): void {
    this.lastFailureTime = Date.now();
    this.circuitBreakerOpen = true;
    this.isHealthy = false;
    this.logger.warn('Circuit breaker opened due to database failure');
  }

  private recordSuccess(): void {
    this.isHealthy = true;
    if (this.circuitBreakerOpen) {
      this.circuitBreakerOpen = false;
      this.logger.log('Circuit breaker closed');
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    this.checkCircuitBreaker();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.recordSuccess();
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `${operationName} attempt ${attempt}/${this.maxRetries} failed`,
          error,
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    this.recordFailure();
    throw new DatabaseException(
      `${operationName} failed after multiple attempts`,
      lastError?.message,
    );
  }

  getPool(): mysql.Pool {
    if (!this.connection) {
      throw new DatabaseException('Database connection not established');
    }
    return this.connection;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    return this.executeWithRetry(async () => {
      const [rows] = await this.connection.query(sql, params);
      return rows as T;
    }, 'Database query');
  }

  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    return this.executeWithRetry(async () => {
      const [result] = await this.connection.execute(sql, params);
      return result as mysql.ResultSetHeader;
    }, 'Database execute');
  }

  async beginTransaction(): Promise<mysql.PoolConnection> {
    return this.executeWithRetry(async () => {
      const connection = await this.connection.getConnection();
      await connection.beginTransaction();
      return connection;
    }, 'Begin transaction');
  }

  async commitTransaction(connection: mysql.PoolConnection): Promise<void> {
    try {
      await connection.commit();
      connection.release();
    } catch (error) {
      connection.release();
      throw new DatabaseException(
        'Failed to commit transaction',
        (error as Error).message,
      );
    }
  }

  async rollbackTransaction(connection: mysql.PoolConnection): Promise<void> {
    try {
      await connection.rollback();
      connection.release();
    } catch (error) {
      connection.release();
      this.logger.error('Failed to rollback transaction:', error);
    }
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    return this.executeWithRetry(
      () => this.connection.getConnection(),
      'Get connection',
    );
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const connection = await this.connection.getConnection();
      await connection.ping();
      connection.release();
      return { healthy: true, message: 'Database connection healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: `Database connection unhealthy: ${(error as Error).message}`,
      };
    }
  }

  getHealthStatus(): { healthy: boolean; circuitBreakerOpen: boolean } {
    return {
      healthy: this.isHealthy,
      circuitBreakerOpen: this.circuitBreakerOpen,
    };
  }

  private async autoSeed() {
    try {
      // Check if table users exists (could fail if schema is not loaded yet)
      const tables = await this.connection.query('SHOW TABLES');
      const tableNames = (tables[0] as any[]).map((t) => Object.values(t)[0]);

      if (
        !tableNames.includes('restaurants') ||
        !tableNames.includes('users')
      ) {
        this.logger.warn(
          'Restaurants or Users table does not exist. Skipping auto-seed.',
        );
        return;
      }

      const [resCountRows] = await this.connection.execute(
        'SELECT COUNT(*) as count FROM restaurants',
      );
      const count = (resCountRows as any)[0]?.count || 0;
      if (count === 0) {
        this.logger.log('Database is empty. Running auto-seeding...');

        const restaurantId = '00000000-0000-0000-0000-000000000001';

        await this.connection.execute(
          `INSERT INTO restaurants (id, name, phone, address, settings) VALUES (?, ?, ?, ?, ?)`,
          [
            restaurantId,
            'Tinyafood Default',
            '123456789',
            'Av. Principal 123',
            '{}',
          ],
        );

        this.logger.log(
          'Auto-seeding completed successfully. Restaurant created. Users will be created via Firebase Auth.',
        );
      }
    } catch (seedError) {
      this.logger.error('Failed to auto-seed database:', seedError);
    }
  }
}
