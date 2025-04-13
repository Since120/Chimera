import { LogLevel } from '@/lib/logger';
import type { PrimaryColor } from '@/styles/theme/types'; // Importiere den Typ

export interface AppConfig {
	name: string;
	description: string;
	direction: 'ltr' | 'rtl';
	language: string;
	theme: 'light' | 'dark' | 'system';
	themeColor: string;
	primaryColor: PrimaryColor; // Verwende den importierten Typ
	logLevel: keyof typeof LogLevel;
}

export const appConfig: AppConfig = {
	name: 'Chimera Dashboard',
	description: 'Discord Bot Management Dashboard',
	direction: 'ltr',
	language: 'de',
	theme: 'light',
	themeColor: '#090a0b',
	primaryColor: 'blue' as PrimaryColor, // Explizite Typzusicherung für den Wert
	logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) || LogLevel.ALL,
};
