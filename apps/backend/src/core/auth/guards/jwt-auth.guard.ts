import { Injectable, Logger, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Explicitly use the 'jwt-supabase' strategy to avoid any confusion
export class JwtAuthGuard extends AuthGuard('jwt-supabase') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  // Override canActivate to add logging
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('=== JWT AUTH GUARD START ===');
    this.logger.log(`Checking authorization for ${context.getHandler().name} in ${context.getClass().name}`);

    try {
      // Call the parent canActivate method
      const result = await super.canActivate(context);

      // Handle both boolean and Observable<boolean> cases
      if (typeof result === 'boolean') {
        this.logger.log(`Authorization ${result ? 'successful' : 'failed'}`);
        this.logger.log('=== JWT AUTH GUARD END ===');
        return result;
      } else {
        // For Observable case, we need to convert it to a Promise
        return new Promise<boolean>((resolve, reject) => {
          result.subscribe({
            next: (value) => {
              this.logger.log(`Authorization ${value ? 'successful' : 'failed'}`);
              this.logger.log('=== JWT AUTH GUARD END ===');
              resolve(value);
            },
            error: (err) => {
              this.logger.error(`Authorization error in observable: ${err.message}`);
              this.logger.error('=== JWT AUTH GUARD END (ERROR) ===');
              reject(err);
            }
          });
        });
      }
    } catch (error) {
      this.logger.error(`Authorization error: ${error.message}`);
      if (error.stack) {
        this.logger.error(`Error stack: ${error.stack}`);
      }
      this.logger.error('=== JWT AUTH GUARD END (ERROR) ===');
      throw error;
    }
  }

  // Override handleRequest to add detailed error logging
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    this.logger.log('=== JWT AUTH GUARD HANDLE REQUEST ===');

    // Log detailed information about the authentication result
    if (err) {
      this.logger.error(`Authentication error: ${err.message}`);
      if (err.stack) {
        this.logger.error(`Error stack: ${err.stack}`);
      }
    }

    if (info) {
      this.logger.warn(`Authentication info: ${JSON.stringify(info)}`);
      if (info.message) {
        this.logger.warn(`Info message: ${info.message}`);
      }
      if (info.name) {
        this.logger.warn(`Info name: ${info.name}`);
      }
    }

    if (user) {
      this.logger.log(`Authenticated user: ${JSON.stringify(user)}`);
    } else {
      this.logger.warn('No user was authenticated');
    }

    // If there was an error or no user was found, throw an exception
    if (err || !user) {
      const errorMessage = err?.message || info?.message || 'Unauthorized';
      this.logger.error(`Authentication failed: ${errorMessage}`);
      this.logger.error('=== JWT AUTH GUARD HANDLE REQUEST END (ERROR) ===');
      throw new UnauthorizedException(errorMessage);
    }

    this.logger.log('=== JWT AUTH GUARD HANDLE REQUEST END ===');
    return user;
  }
}
