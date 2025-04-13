import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Supabase
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_KEY: Joi.string().required(), // anon key for client operations
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(), // service role key for admin operations

  // Discord (Client ID/Secret/Callback URL no longer required here, handled by Supabase Auth)
  DISCORD_CLIENT_ID: Joi.string(), // Removed .required()
  DISCORD_CLIENT_SECRET: Joi.string(), // Removed .required()
  DISCORD_BOT_TOKEN: Joi.string().required(), // Bot token is still needed
  DISCORD_CALLBACK_URL: Joi.string(), // Removed .required()

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),

  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // Frontend
  FRONTEND_URL: Joi.string().default('http://localhost:3001'),
});
