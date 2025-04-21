import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException, Inject } from '@nestjs/common';
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

    if (!user || !user.id) {
      this.logger.warn('PermissionGuard: User object or userProfileId (user.id) not found in request. Denying access.');
      throw new ForbiddenException('Authentication required or user profile ID missing.');
    }

    if (!guildId) {
      this.logger.warn('PermissionGuard: Could not determine Guild ID from request. Denying access.');
      throw new ForbiddenException('Guild context is required.');
    }

    // Hole userProfileId direkt aus dem User-Objekt
    const userProfileId = user.id;
    this.logger.debug(`PermissionGuard: Using userProfileId ${userProfileId} from request user object.`);

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
