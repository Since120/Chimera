import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../access-control.service';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(AccessControlService) // Explizite Injektion
    private accessControlService: AccessControlService,
    private databaseService: DatabaseService, // DatabaseService injizieren
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Wenn keine Permissions für die Route definiert sind, Zugriff erlauben
    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug('No specific permissions required for this route. Access granted.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Kommt vom JwtAuthGuard
    const params = request.params;
    // Guild ID muss zuverlässig extrahiert werden (aus Params, Query oder Body)
    const guildId = params.guildId || params.id || request.query.guildId || request.query.scopeId ||
                   request.body?.guildId || request.body?.guild_id || request.body?.scope?.scopeId;

    if (!user || !user.supabaseUserId) {
      this.logger.warn('PermissionGuard: User object or supabaseUserId not found in request. Denying access.');
      throw new ForbiddenException('Authentication required.');
    }

    if (!guildId) {
      this.logger.warn('PermissionGuard: Could not determine Guild ID from request. Denying access.');
      throw new ForbiddenException('Guild context is required.');
    }

    // --- KORREKTUR: user_profile_id holen ---
    let userProfileId: string;
    try {
        const { data: userProfile, error: profileError } = await this.databaseService.adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.supabaseUserId) // Suche über auth_id (FK zu Supabase Auth User)
          .single(); // single() verwenden, da es nur einen geben sollte

        if (profileError && profileError.code !== 'PGRST116') { // Fehler, aber nicht "nicht gefunden"
          this.logger.error(`PermissionGuard: Error fetching user profile for supabaseUserId ${user.supabaseUserId}: ${profileError.message}`);
          throw new ForbiddenException('Could not verify user profile.');
        }
        if (!userProfile) {
            this.logger.error(`PermissionGuard: User profile not found for supabaseUserId ${user.supabaseUserId}. Denying access.`);
            throw new ForbiddenException('User profile not found.');
        }
        userProfileId = userProfile.id;
        this.logger.debug(`PermissionGuard: Found userProfileId ${userProfileId} for supabaseUserId ${user.supabaseUserId}`);
    } catch (error) {
        this.logger.error(`PermissionGuard: Unexpected error fetching user profile: ${error.message}`, error.stack);
        throw new ForbiddenException('Error verifying user profile.');
    }

    this.logger.debug(`Checking permissions for user ${userProfileId} in guild ${guildId}. Required: ${JSON.stringify(requiredPermissions)}`);

    // Prüfe jede benötigte Permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.accessControlService.canUserPerformAction(
        userProfileId,
        guildId,
        permission.key,
      );
      if (!hasPermission) {
        this.logger.warn(`User ${userProfileId} denied access to guild ${guildId}. Missing permission: ${permission.key}`);
        throw new ForbiddenException(`Missing required permission: ${permission.key}`);
      }
    }

    this.logger.debug(`User ${userProfileId} has all required permissions in guild ${guildId}. Access granted.`);
    return true;
  }
}
