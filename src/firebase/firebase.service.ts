import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, App, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken, UserRecord } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured. Firebase Auth will not work.',
      );
      return;
    }

    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
    } else {
      this.app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }

    this.logger.log('Firebase Admin SDK initialized successfully');
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return getAuth(this.app).verifyIdToken(token);
  }

  async getUserByUid(uid: string): Promise<UserRecord> {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return getAuth(this.app).getUser(uid);
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    try {
      return await getAuth(this.app).getUserByEmail(email);
    } catch {
      return null;
    }
  }

  async createUser(data: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<UserRecord> {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return getAuth(this.app).createUser(data);
  }

  async deleteUser(uid: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return getAuth(this.app).deleteUser(uid);
  }

  isInitialized(): boolean {
    return !!this.app;
  }
}
