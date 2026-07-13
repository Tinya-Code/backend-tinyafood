import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async login(idToken: string) {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);

    // 1. Buscar por firebase_uid
    let user = await this.usersService.findByFirebaseUid(decodedToken.uid);

    // 2. Si no existe por firebase_uid, buscar por email
    if (!user && decodedToken.email) {
      user = await this.usersService.findOneByEmail(decodedToken.email);

      // Si existe por email, vincular el firebase_uid
      if (user) {
        await this.usersService.updateFirebaseUid(user.id, decodedToken.uid);
        user.firebase_uid = decodedToken.uid;
      }
    }

    // 3. Si no existe en absoluto, crear nuevo usuario
    if (!user) {
      if (!decodedToken.email) {
        throw new BadRequestException('Firebase token must include an email');
      }

      user = await this.usersService.create({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        restaurant_id: '', // Will be assigned later
        role: 'staff',
      } as any);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurant_id,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
