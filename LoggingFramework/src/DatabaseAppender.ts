import { IAppender } from "./IAppender";
import { LogLevel } from "./LogLevel";

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  name: string;
  hostName: string;
  password: string;
  port: number;
  storageTable: string;
}

/**
 * DatabaseAppender - Appends logs to a database table
 */
export class DatabaseAppender implements IAppender {
  private dbConfig: DatabaseConfig;

  constructor(dbConfig: DatabaseConfig) {
    this.dbConfig = dbConfig;
  }

  /**
   * Appends log message to database
   * Note: In a real implementation, this would handle database operations
   */
  append(logLevel: LogLevel, message: string): void {
    const logEntry = {
      level: logLevel,
      message: message,
      timestamp: new Date().toISOString()
    };
    // In real implementation: insert into database table
    console.log(`[DATABASE] Inserting into ${this.dbConfig.storageTable}@${this.dbConfig.hostName}:`, logEntry);
  }

  getType(): string {
    return "DATABASE";
  }

  getConfig(): DatabaseConfig {
    return { ...this.dbConfig }; // Return copy to prevent external modification
  }

  setConfig(config: DatabaseConfig): void {
    if (config) {
      this.dbConfig = { ...config };
    }
  }
}
