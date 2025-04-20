import { Module } from '@nestjs/common'; // forwardRef nicht mehr nötig
import { DatabaseModule } from '../../database';
import { PermissionsService } from './permissions.service';
import { AccessControlService } from './access-control.service';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [], // Controller kommt später
  providers: [PermissionsService, AccessControlService, PermissionGuard], // Services und Guard hinzufügen
  exports: [PermissionsService, AccessControlService, PermissionGuard] // Services und Guard exportieren
})
export class PermissionsModule {}
