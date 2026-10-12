import { IAppender } from "./IAppender";
import { LogLevel } from "./LogLevel";

/**
 * Cloud storage configuration interface
 */
export interface StorageAccountConfig {
  accountName: string;
  secretKey: string;
  storagePath: string;
}

/**
 * CloudAppender - Appends logs to cloud storage
 */
export class CloudAppender implements IAppender {
  private storageAccountConfig: StorageAccountConfig;

  constructor(storageAccountConfig: StorageAccountConfig) {
    this.storageAccountConfig = storageAccountConfig;
  }

  /**
   * Appends log message to cloud storage
   * Note: In a real implementation, this would handle cloud storage operations
   */
  append(logLevel: LogLevel, message: string): void {
    const logEntry = {
      level: logLevel,
      message: message,
      timestamp: new Date().toISOString()
    };
    // In real implementation: upload to cloud storage
    console.log(`[CLOUD] Uploading to ${this.storageAccountConfig.accountName}/${this.storageAccountConfig.storagePath}:`, logEntry);
  }

  getType(): string {
    return "CLOUD";
  }

  getConfig(): StorageAccountConfig {
    return { ...this.storageAccountConfig }; // Return copy to prevent external modification
  }

  setConfig(config: StorageAccountConfig): void {
    if (config) {
      this.storageAccountConfig = { ...config };
    }
  }
}
