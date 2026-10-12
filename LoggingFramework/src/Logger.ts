import { LogLevel } from "./LogLevel";
import { IAppender } from "./IAppender";
import { LogConfiguration } from "./LogConfiguration";

/**
 * Logger - Main class for logging operations
 * Uses composition to manage log configuration
 */
export class Logger {
  private configuration: LogConfiguration;

  constructor() {
    this.configuration = new LogConfiguration();
  }

  /**
   * Logs a message at the specified level
   * @param level - The log level
   * @param message - The message to log
   */
  log(level: LogLevel, message: string): void {
    const appenders = this.configuration.getAppenders(level);
    
    if (appenders.size === 0) {
      // No appenders configured for this level - silently ignore or log warning
      return;
    }

    // Send message to all appenders for this level
    appenders.forEach(appender => {
      try {
        appender.append(level, message);
      } catch (error) {
        // Handle appender errors gracefully
        console.error(`Error in appender ${appender.getType()}:`, error);
      }
    });
  }

  /**
   * Logs an INFO level message
   * @param message - The message to log
   */
  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Logs an ERROR level message
   * @param message - The message to log
   */
  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  /**
   * Logs a DEBUG level message
   * @param message - The message to log
   */
  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Configures appenders for a specific log level
   * Supports runtime configuration changes
   * @param level - The log level
   * @param appenders - Array of appenders to configure for this level
   */
  configureAppendersFor(level: LogLevel, appenders: IAppender[]): void {
    this.configuration.setAppenders(level, appenders);
  }

  /**
   * Gets all appenders configured for a specific log level
   * @param level - The log level
   * @returns Array of appenders for the level
   */
  getAppendersFor(level: LogLevel): IAppender[] {
    return Array.from(this.configuration.getAppenders(level));
  }

  /**
   * Gets the log configuration object
   * @returns The LogConfiguration instance
   */
  getConfiguration(): LogConfiguration {
    return this.configuration;
  }

  /**
   * Gets all configured log levels
   * @returns Array of log levels
   */
  getLogLevels(): LogLevel[] {
    return this.configuration.getAllLevels();
  }
}
