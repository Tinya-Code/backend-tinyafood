import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DatabaseModule } from '../../services/database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [DatabaseModule, FirebaseModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
