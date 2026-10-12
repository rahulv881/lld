import { LogLevel } from "./LogLevel";

/**
 * Interface for all appender implementations
 * Follows Strategy Pattern - allows different appender types to be interchangeable
 */
export interface IAppender {
  /**
   * Appends a log message to the appender's destination
   * @param logLevel - The log level of the message
   * @param message - The log message to append
   */
  append(logLevel: LogLevel, message: string): void;

  /**
   * Returns the type of the appender (e.g., "FILE", "DATABASE", "CLOUD")
   */
  getType(): string;

  /**
   * Gets the current configuration of the appender
   */
  getConfig(): any;

  /**
   * Sets/updates the configuration of the appender
   * @param config - Configuration object specific to appender type
   */
  setConfig(config: any): void;
}
