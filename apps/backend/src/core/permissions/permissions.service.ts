import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { PermissionDto } from 'shared-types'; // Importiere den Shared Type

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Fetches all defined permissions from the database.
   * @returns Promise<PermissionDto[]>
   */
  async findAllPermissions(): Promise<PermissionDto[]> {
    this.logger.log('Fetching all defined permissions...');
    const { data, error } = await this.databaseService.adminClient
      .from('permissions')
      .select('id, permission_key, description, module'); // Spaltennamen anpassen, falls nötig

    if (error) {
      this.logger.error(`Error fetching permissions: ${error.message}`, error.stack);
      throw new Error(`Database error fetching permissions: ${error.message}`);
    }

    // Map to DTO, stelle sicher, dass die Spaltennamen passen
    const permissions = data.map(p => ({
        id: p.id,
        permissionKey: p.permission_key,
        description: p.description,
        module: p.module
    }));

    this.logger.log(`Found ${permissions.length} permissions.`);
    return permissions;
  }

   /**
   * Finds a permission ID by its key. (Wird später vom AccessControlService benötigt)
   * @param permissionKey The unique key string of the permission.
   * @returns Promise<number | null> The ID of the permission or null if not found.
   */
   async findPermissionIdByKey(permissionKey: string): Promise<number | null> {
     this.logger.debug(`Finding permission ID for key: ${permissionKey}`);
     const { data, error } = await this.databaseService.adminClient
       .from('permissions')
       .select('id')
       .eq('permission_key', permissionKey)
       .maybeSingle(); // Verwende maybeSingle, da es null zurückgeben kann

     if (error) {
       this.logger.error(`Error finding permission by key '${permissionKey}': ${error.message}`);
       // Wir werfen hier keinen Fehler, sondern geben null zurück, damit der aufrufende Service entscheiden kann
       return null;
     }

     if (!data) {
         this.logger.warn(`Permission with key '${permissionKey}' not found.`);
         return null;
     }

     this.logger.debug(`Found permission ID ${data.id} for key ${permissionKey}`);
     return data.id;
   }
}
