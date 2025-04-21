import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DatabaseService } from '../../../database/database.service'; // DatabaseService importieren
import { UserProfileDto } from 'shared-types'; // UserProfileDto importieren

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-supabase') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService, // DatabaseService injizieren
  ) {
    // Create a local logger since we can't use this.logger before super()
    const logger = new Logger(JwtStrategy.name);
    logger.log('=== JWT STRATEGY INITIALIZATION START ===');

    try {
      // Get the required configuration values
      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      const supabaseJwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');

      // Validate required configuration
      if (!supabaseUrl) {
        logger.error('SUPABASE_URL is not configured in environment variables.');
        throw new Error('SUPABASE_URL is not configured in environment variables.');
      }

      if (!supabaseJwtSecret) {
        logger.error('SUPABASE_JWT_SECRET is not configured in environment variables.');
        throw new Error('SUPABASE_JWT_SECRET is not configured in environment variables.');
      }

      logger.log(`Using Supabase URL: ${supabaseUrl}`);
      logger.log(`Using Supabase JWT Secret: ${supabaseJwtSecret.substring(0, 10)}...`);

      // Standard Supabase audience for JWTs issued by Supabase Auth
      const supabaseJwtAudience = 'authenticated';
      logger.log(`Using audience: ${supabaseJwtAudience}`);

      // Determine issuer based on Supabase URL
      const issuer = supabaseUrl.includes('supabase.co') ? `${supabaseUrl}/auth/v1` : supabaseUrl;
      logger.log(`Using issuer: ${issuer}`);

      // Call super with the configuration for HS256
      super({
        // Use the JWT secret for HS256 validation
        secretOrKey: supabaseJwtSecret,
        // Extract the JWT from the Authorization header as a Bearer token
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Validate the audience ('aud' claim) in the JWT
        audience: supabaseJwtAudience,
        // Validate the issuer ('iss' claim) in the JWT
        issuer: issuer,
        // Specify the expected signing algorithm
        algorithms: ['HS256'], // Supabase uses HS256 for its JWTs
        // Do not ignore token expiration
        ignoreExpiration: false,
        // Pass request to callback for additional logging
        passReqToCallback: true
      });

      // Now we can use this.logger since super() has been called
      this.logger.log('Passport strategy configuration completed successfully with HS256');
      this.logger.log('=== JWT STRATEGY INITIALIZATION COMPLETE ===');
    } catch (error) {
      // Use the local logger since this.logger might not be available if super() failed
      logger.error(`JWT Strategy initialization error: ${error.message}`);
      logger.error(error.stack);
      logger.error('=== JWT STRATEGY INITIALIZATION FAILED ===');
      throw error;
    }
  }

  // This method is called by Passport after the token signature and claims (aud, iss, exp) have been verified.
  async validate(req: Request, payload: any) {
    this.logger.log('=== JWT VALIDATION START (HS256) ===');
    this.logger.log(`JwtStrategy.validate called with request and payload`);

    try {
      // Log the token from the request for debugging
      const authHeader = req.headers?.['authorization'] as string || '';
      const token = authHeader.replace('Bearer ', '') || 'No token found';
      this.logger.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);
      this.logger.log(`Request URL: ${req.url}`);
      this.logger.log(`Request method: ${req.method}`);
      this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);

      // Log the full payload for debugging
      this.logger.log(`Full JWT payload: ${JSON.stringify(payload, null, 2)}`);

      // Log specific claims that are important for validation
      this.logger.log(`JWT claims - sub: ${payload.sub || 'MISSING'}, aud: ${payload.aud || 'MISSING'}, iss: ${payload.iss || 'MISSING'}`);
      this.logger.log(`JWT exp: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'MISSING'}, iat: ${payload.iat ? new Date(payload.iat * 1000).toISOString() : 'MISSING'}`);

      // Ensure the Supabase User ID ('sub' claim) is present
      if (!payload.sub) {
        this.logger.error('Supabase JWT payload is missing required claim: sub (Supabase User ID).');
        throw new UnauthorizedException('Invalid token claims: Missing Supabase User ID.');
      }
      const supabaseUserId = payload.sub;

      // Check other required claims
      if (!payload.aud) {
        this.logger.error(`JWT is missing 'aud' claim. Expected 'authenticated'.`);
        throw new UnauthorizedException(`Invalid token: Missing 'aud' claim`);
      }

      if (!payload.iss) {
        this.logger.error(`JWT is missing 'iss' claim.`);
        throw new UnauthorizedException(`Invalid token: Missing 'iss' claim`);
      }

      // --- User-Profil aus DB laden ---
      this.logger.debug(`Fetching user profile for validated supabaseUserId: ${supabaseUserId}`);
      const { data: userProfile, error: profileError } = await this.databaseService.adminClient
        .from('user_profiles')
        .select('id, discord_id, username, avatar_url, global_tracking_disabled') // Benötigte Felder auswählen
        .eq('auth_id', supabaseUserId)
        .single(); // Es sollte nur einen geben

      if (profileError && profileError.code !== 'PGRST116') {
        this.logger.error(`Error fetching user profile during JWT validation: ${profileError.message}`);
        throw new UnauthorizedException('Could not retrieve user profile.');
      }

      if (!userProfile) {
        this.logger.error(`User profile not found for validated supabaseUserId ${supabaseUserId}. This indicates a sync issue.`);
        throw new NotFoundException(`User profile for authenticated user not found.`);
      }
      this.logger.debug(`User profile found: ${userProfile.username} (ID: ${userProfile.id})`);

      // Konstruiere das neue User-Objekt für req.user
      const reqUserObject = {
          id: userProfile.id, // Das ist die user_profile_id (UUID)
          supabaseUserId: supabaseUserId, // Behalten wir zur Referenz
          discordId: userProfile.discord_id,
          username: userProfile.username,
          // Füge weitere Felder hinzu, die oft benötigt werden könnten
          avatarUrl: userProfile.avatar_url,
          globalTrackingDisabled: userProfile.global_tracking_disabled
      };

      this.logger.log(`JWT validation successful for user ID: ${supabaseUserId}`);
      this.logger.log(`Returning user object for request: ${JSON.stringify(reqUserObject)}`);
      this.logger.log('=== JWT VALIDATION END (HS256) ===');

      // The controller using this strategy will receive this returned object as `req.user`
      return reqUserObject; // Das neue Objekt zurückgeben
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      if (error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      this.logger.error('=== JWT VALIDATION END (ERROR) ===');
      throw error;
    }
  }
}
