import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { DatabaseModule } from '../../services/database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [DatabaseModule, FirebaseModule],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
