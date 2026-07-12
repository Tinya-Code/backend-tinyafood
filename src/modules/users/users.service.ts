import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.db.query<any[]>(
      `SELECT id FROM users WHERE email = ?`,
      [createUserDto.email],
    );

    if (existing.length > 0) {
      throw new ConflictException(`Email ${createUserDto.email} is already in use`);
    }

    const id = randomUUID();

    await this.db.execute(
      `INSERT INTO users (id, firebase_uid, restaurant_id, name, email, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        createUserDto.firebase_uid || '',
        createUserDto.restaurant_id,
        createUserDto.name,
        createUserDto.email,
        createUserDto.role,
      ],
    );

    return this.findOne(id);
  }

  async findAll(restaurantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const rows = await this.db.query<any[]>(
      `SELECT id, firebase_uid, restaurant_id, name, email, role, is_active, created_at, updated_at 
       FROM users 
       WHERE restaurant_id = ? AND is_active = 1 
       LIMIT ? OFFSET ?`,
       [restaurantId, Number(limit), Number(offset)],
    );

    const [{ total }] = await this.db.query<any[]>(
      `SELECT COUNT(*) as total FROM users WHERE restaurant_id = ? AND is_active = 1`,
      [restaurantId],
    );

    return {
      data: rows,
      total,
    };
  }

  async findOne(id: string) {
    const rows = await this.db.query<any[]>(
      `SELECT id, firebase_uid, restaurant_id, name, email, role, is_active, created_at, updated_at 
       FROM users 
       WHERE id = ? AND is_active = 1`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return rows[0];
  }

  async findByFirebaseUid(firebaseUid: string) {
    const rows = await this.db.query<any[]>(
      `SELECT id, firebase_uid, restaurant_id, name, email, role, is_active 
       FROM users 
       WHERE firebase_uid = ? AND is_active = 1`,
      [firebaseUid],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async findOneByEmail(email: string) {
    const rows = await this.db.query<any[]>(
      `SELECT id, firebase_uid, restaurant_id, name, email, role, is_active 
       FROM users 
       WHERE email = ? AND is_active = 1`,
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const fields: string[] = [];
    const params: any[] = [];

    if (updateUserDto.name !== undefined) {
      fields.push('name = ?');
      params.push(updateUserDto.name);
    }

    if (updateUserDto.email !== undefined) {
      const existing = await this.db.query<any[]>(
        `SELECT id FROM users WHERE email = ? AND id != ?`,
        [updateUserDto.email, id],
      );
      if (existing.length > 0) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
      }
      fields.push('email = ?');
      params.push(updateUserDto.email);
    }

    if (updateUserDto.role !== undefined) {
      fields.push('role = ?');
      params.push(updateUserDto.role);
    }

    if (updateUserDto.restaurant_id !== undefined) {
      fields.push('restaurant_id = ?');
      params.push(updateUserDto.restaurant_id);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    params.push(id);

    await this.db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.execute(
      `UPDATE users SET is_active = 0 WHERE id = ?`,
      [id],
    );
    return { id };
  }

  async updateFirebaseUid(id: string, firebaseUid: string): Promise<void> {
    await this.db.execute(
      `UPDATE users SET firebase_uid = ? WHERE id = ?`,
      [firebaseUid, id],
    );
  }
}
