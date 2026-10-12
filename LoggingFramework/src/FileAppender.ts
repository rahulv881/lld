import { IAppender } from "./IAppender";
import { LogLevel } from "./LogLevel";

/**
 * FileAppender - Appends logs to a file
 */
export class FileAppender implements IAppender {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Appends log message to file
   * Note: In a real implementation, this would handle file I/O operations
   */
  append(logLevel: LogLevel, message: string): void {
    const logEntry = `[${new Date().toISOString()}] [${logLevel}] ${message}\n`;
    // In real implementation: write to file at this.filePath
    console.log(`[FILE] Writing to ${this.filePath}: ${logEntry.trim()}`);
  }

  getType(): string {
    return "FILE";
  }

  getConfig(): { filePath: string } {
    return { filePath: this.filePath };
  }

  setConfig(config: { filePath: string }): void {
    if (config && config.filePath) {
      this.filePath = config.filePath;
    }
  }
}
