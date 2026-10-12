import { LogLevel } from "./LogLevel";
import { IAppender } from "./IAppender";

/**
 * LogConfiguration - Manages the mapping between log levels and appenders
 * Supports runtime configuration changes
 */
export class LogConfiguration {
  private levelAppenderMap: Map<LogLevel, Set<IAppender>>;

  constructor() {
    this.levelAppenderMap = new Map();
    // Initialize all log levels with empty sets
    Object.values(LogLevel).forEach(level => {
      this.levelAppenderMap.set(level as LogLevel, new Set<IAppender>());
    });
  }

  /**
   * Adds an appender for a specific log level
   * @param level - The log level
   * @param appender - The appender to add
   */
  addAppender(level: LogLevel, appender: IAppender): void {
    const appenders = this.levelAppenderMap.get(level);
    if (appenders) {
      appenders.add(appender);
    } else {
      const newSet = new Set<IAppender>();
      newSet.add(appender);
      this.levelAppenderMap.set(level, newSet);
    }
  }

  /**
   * Removes an appender for a specific log level
   * @param level - The log level
   * @param appender - The appender to remove
   */
  removeAppender(level: LogLevel, appender: IAppender): void {
    const appenders = this.levelAppenderMap.get(level);
    if (appenders) {
      appenders.delete(appender);
    }
  }

  /**
   * Gets all appenders for a specific log level
   * @param level - The log level
   * @returns Set of appenders for the level
   */
  getAppenders(level: LogLevel): Set<IAppender> {
    return this.levelAppenderMap.get(level) || new Set<IAppender>();
  }

  /**
   * Sets appenders for a specific log level (replaces existing appenders)
   * Supports runtime configuration changes
   * @param level - The log level
   * @param appenders - Array of appenders to set
   */
  setAppenders(level: LogLevel, appenders: IAppender[]): void {
    const appenderSet = new Set<IAppender>(appenders);
    this.levelAppenderMap.set(level, appenderSet);
  }

  /**
   * Gets all configured log levels
   * @returns Array of log levels that have at least one appender
   */
  getAllLevels(): LogLevel[] {
    return Array.from(this.levelAppenderMap.keys());
  }

  /**
   * Clears all appenders for all levels
   */
  clear(): void {
    this.levelAppenderMap.forEach((appenders) => appenders.clear());
  }

  /**
   * Gets all appenders for all levels
   * @returns Map of log level to appenders
   */
  getAllAppenders(): Map<LogLevel, Set<IAppender>> {
    return new Map(this.levelAppenderMap);
  }
}
