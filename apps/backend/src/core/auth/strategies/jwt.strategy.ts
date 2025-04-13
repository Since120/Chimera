import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-supabase') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
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

      // Check other required claims
      if (!payload.aud) {
        this.logger.error(`JWT is missing 'aud' claim. Expected 'authenticated'.`);
        throw new UnauthorizedException(`Invalid token: Missing 'aud' claim`);
      }

      if (!payload.iss) {
        this.logger.error(`JWT is missing 'iss' claim.`);
        throw new UnauthorizedException(`Invalid token: Missing 'iss' claim`);
      }

      // Construct the validated user object
      const validatedUser = {
        supabaseUserId: payload.sub,
        email: payload.email,
        role: payload.role || 'authenticated',
        aud: payload.aud,
        iss: payload.iss
      };

      this.logger.log(`JWT validation successful for user ID: ${payload.sub}`);
      this.logger.log(`Returning validated user: ${JSON.stringify(validatedUser)}`);
      this.logger.log('=== JWT VALIDATION END (HS256) ===');

      // The controller using this strategy will receive this returned object as `req.user`
      return validatedUser;
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
