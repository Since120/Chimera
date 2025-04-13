'use server';

import { cookies } from 'next/headers';

import type { Settings } from '@/types/settings';
import { logger } from '@/lib/default-logger';

/**
 * Store settings (partial patch) in client's cookies.
 * This should be used as Server Action.
 *
 * To remove a specific key, set its value to `null`.
 */
export async function setSettings(settings: Partial<Settings>): Promise<void> {
	const cookieStore = await cookies();
	
	// Aktuelle Einstellungen holen und mit neuen zusammenführen
	const currentSettings = await getSettings();
	const mergedSettings = { ...currentSettings, ...settings };
	
	// Alle null-Werte entfernen (um Keys zu löschen)
	Object.keys(mergedSettings).forEach(key => {
		if (mergedSettings[key] === null) {
			delete mergedSettings[key];
		}
	});
	
	// Neue Einstellungen speichern
	cookieStore.set('settings', JSON.stringify(mergedSettings));
}

/**
 * Retrieve the settings from client's cookies.
 * This should be used in Server Components.
 */
export async function getSettings(): Promise<Partial<Settings>> {
	const cookieStore = await cookies();

	const settingsStr = cookieStore.get('settings')?.value;
	let settings: Partial<Settings>;

	if (settingsStr) {
		try {
			settings = JSON.parse(settingsStr) as Partial<Settings>;
		} catch {
			logger.error('Unable to parse the settings');
		}
	}

	settings ||= {};

	return settings;
}
