import { SetMetadata } from '@nestjs/common';

export interface RequiredPermission {
    key: string; // z.B. 'category:create'
    // Zukünftig ggf. Bedingungen hinzufügen, z.B. nur für eigene Ressourcen
}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: RequiredPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
