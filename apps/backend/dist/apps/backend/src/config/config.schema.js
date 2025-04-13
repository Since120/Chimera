"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configValidationSchema = void 0;
const Joi = require("joi");
exports.configValidationSchema = Joi.object({
    SUPABASE_URL: Joi.string().required(),
    SUPABASE_KEY: Joi.string().required(),
    DISCORD_CLIENT_ID: Joi.string(),
    DISCORD_CLIENT_SECRET: Joi.string(),
    DISCORD_BOT_TOKEN: Joi.string().required(),
    DISCORD_CALLBACK_URL: Joi.string(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('1d'),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    FRONTEND_URL: Joi.string().default('http://localhost:3001'),
});
//# sourceMappingURL=config.schema.js.map