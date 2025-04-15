import { Injectable, LoggerService, LogLevel, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as chalk from 'chalk';

@Injectable()
export class CustomLoggerService implements LoggerService {
  public logLevels: LogLevel[] = ['error', 'warn', 'log'];
  private excludePatterns: RegExp[] = [
    // Auth-bezogene Logs
    /^JwtStrategy/,
    /^JwtAuthGuard/,
    /^Full JWT payload/,
    /^JWT claims/,
    /^JWT exp/,
    /^Token \(first 20 chars\)/,
    /^Authenticated user/,
    /^Authorization successful/,
    /^Checking authorization/,
    /^=== JWT/,
    /^JWT validation successful/,
    /^Returning validated user/,

    // AuthController-bezogene Logs
    /^\[AuthController\] === GET SESSION START/,
    /^\[AuthController\] === GET SESSION END/,
    /^\[AuthController\] getSession:/,

    // BotGateway-bezogene Logs
    /^Registering guild member:/,
    /^Registriere Server:/,
    /^Server .* hat .* Mitglieder/,
    /^.* Mitglieder für Server .* registriert/,

    // Andere häufige Logs
    /^Getting categories for scope:/,
    /^Getting zones for category:/,
    /^Suche Discord-Guild-ID für UUID:/,
    /^Discord-Guild-ID gefunden:/,
  ];

  constructor(@Optional() private readonly configService?: ConfigService) {
    if (this.configService) {
      const logLevel = this.configService.get<string>('LOG_LEVEL', 'log');
      this.setLogLevels(logLevel);
    }
  }

  /**
   * Setzt die Log-Levels basierend auf dem angegebenen Log-Level
   * @param levels Die Log-Levels oder ein einzelnes Log-Level als String
   */
  public setLogLevels(levels: LogLevel[] | string): any {
    if (typeof levels === 'string') {
      const level = levels;
      switch (level) {
        case 'error':
          this.logLevels = ['error'];
          break;
        case 'warn':
          this.logLevels = ['error', 'warn'];
          break;
        case 'log':
          this.logLevels = ['error', 'warn', 'log'];
          break;
        case 'debug':
          this.logLevels = ['error', 'warn', 'log', 'debug'];
          break;
        case 'verbose':
          this.logLevels = ['error', 'warn', 'log', 'debug', 'verbose'];
          break;
        default:
          this.logLevels = ['error', 'warn', 'log'];
      }
    } else {
      this.logLevels = levels;
    }
    return this;
  }

  log(message: any, ...optionalParams: any[]) {
    // Wenn die Nachricht nur für Debug-Level bestimmt ist und Debug nicht aktiviert ist, nicht loggen
    if (typeof message === 'string' && this.isDebugOnly(message) && !this.logLevels.includes('debug')) {
      return;
    }

    if (this.isLevelEnabled('log') && !this.isExcluded(message)) {
      this.printMessage(message, optionalParams, 'log');
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.isLevelEnabled('error')) {
      this.printMessage(message, optionalParams, 'error');
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.isLevelEnabled('warn')) {
      this.printMessage(message, optionalParams, 'warn');
    }
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.isLevelEnabled('debug') && !this.isExcluded(message)) {
      this.printMessage(message, optionalParams, 'debug');
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (this.isLevelEnabled('verbose') && !this.isExcluded(message)) {
      this.printMessage(`[VERBOSE] ${message}`, optionalParams, 'verbose');
    }
  }

  /**
   * Gibt eine formatierte Nachricht aus
   */
  private printMessage(message: any, optionalParams: any[], level: string): void {
    const context = optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === 'string'
      ? optionalParams.pop()
      : '';

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(message, level, context, timestamp);

    switch (level) {
      case 'error':
        console.error(formattedMessage, ...optionalParams);
        break;
      case 'warn':
        console.warn(formattedMessage, ...optionalParams);
        break;
      case 'debug':
        console.debug(formattedMessage, ...optionalParams);
        break;
      default:
        console.log(formattedMessage, ...optionalParams);
    }
  }

  /**
   * Formatiert eine Nachricht mit Farben und Kontext
   */
  private formatMessage(message: any, level: string, context: string, timestamp: string): string {
    let levelColor: string;
    switch (level) {
      case 'error':
        levelColor = 'red';
        break;
      case 'warn':
        levelColor = 'yellow';
        break;
      case 'debug':
        levelColor = 'blue';
        break;
      case 'verbose':
        levelColor = 'gray';
        break;
      default:
        levelColor = 'green';
    }

    const levelText = level.toUpperCase().padEnd(7);
    const timestampText = chalk.gray(`[${timestamp}]`);
    const levelLabel = chalk[levelColor](`[${levelText}]`);
    const contextText = context ? chalk.cyan(`[${context}]`) : '';

    return `${timestampText} ${levelLabel} ${contextText} ${message}`;
  }

  private isLevelEnabled(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  // Muster für Logs, die auf DEBUG-Level heruntergestuft werden sollen
  private debugOnlyPatterns: RegExp[] = [
    // Auth-bezogene Logs
    /^\[JwtStrategy\]/,
    /^\[JwtAuthGuard\]/,
    /^\[AuthController\]/,
  ];

  private isExcluded(message: string): boolean {
    if (typeof message !== 'string') return false;

    // Wenn das Log-Level DEBUG ist, nichts ausschließen
    if (this.logLevels.includes('debug') && this.isDebugOnly(message)) {
      return false;
    }

    return this.excludePatterns.some(pattern => pattern.test(message));
  }

  private isDebugOnly(message: string): boolean {
    if (typeof message !== 'string') return false;

    return this.debugOnlyPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Fügt ein neues Ausschlussmuster hinzu
   * @param pattern Das Regex-Muster, das ausgeschlossen werden soll
   */
  public addExcludePattern(pattern: RegExp): void {
    this.excludePatterns.push(pattern);
  }
}
