// Dayjs-Bibliothek für Datums- und Zeitformatierung
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/de';

// Plugins registrieren
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Standardsprache auf Deutsch setzen
dayjs.locale('de');

export { dayjs };
