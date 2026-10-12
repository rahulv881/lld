import { Logger } from "../src/Logger";
import { LogLevel } from "../src/LogLevel";
import { FileAppender } from "../src/FileAppender";
import { DatabaseAppender } from "../src/DatabaseAppender";
import { CloudAppender } from "../src/CloudAppender";

/**
 * Example usage of the Logging Framework
 */
function demonstrateLoggingFramework() {
  console.log("=== Logging Framework Demo ===\n");

  // 1. Create appenders
  console.log("1. Creating appenders...");
  const fileAppender = new FileAppender("/var/log/application.log");
  const dbAppender = new DatabaseAppender({
    name: "logs_db",
    hostName: "localhost",
    password: "secret123",
    port: 5432,
    storageTable: "log_entries"
  });
  const cloudAppender = new CloudAppender({
    accountName: "my-storage-account",
    secretKey: "secret-key-123",
    storagePath: "logs/application"
  });

  // 2. Create logger
  console.log("2. Creating logger...");
  const logger = new Logger();

  // 3. Configure appenders for different log levels
  console.log("3. Configuring appenders for log levels...");
  
  // INFO level: File + Cloud
  logger.configureAppendersFor(LogLevel.INFO, [fileAppender, cloudAppender]);
  
  // ERROR level: File + Database + Cloud (all three)
  logger.configureAppendersFor(LogLevel.ERROR, [fileAppender, dbAppender, cloudAppender]);
  
  // DEBUG level: File only
  logger.configureAppendersFor(LogLevel.DEBUG, [fileAppender]);

  console.log("\n4. Logging messages...\n");

  // 4. Use logger
  logger.info("Application started successfully");
  logger.error("Failed to connect to database");
  logger.debug("Processing user request with ID: 12345");
  logger.info("User logged in: john.doe@example.com");
  logger.error("Invalid credentials provided");

  // 5. Demonstrate runtime configuration change
  console.log("\n5. Changing configuration at runtime...");
  console.log("   Removing cloud appender from INFO level\n");
  
  // Change INFO level to only use FileAppender
  logger.configureAppendersFor(LogLevel.INFO, [fileAppender]);

  logger.info("This INFO message will only go to file appender");
  logger.error("This ERROR message still goes to all three appenders");

  // 6. Display current configuration
  console.log("\n6. Current configuration:");
  const config = logger.getConfiguration();
  Object.values(LogLevel).forEach(level => {
    const appenders = logger.getAppendersFor(level as LogLevel);
    console.log(`   ${level}: ${appenders.length} appender(s)`);
    appenders.forEach(appender => {
      console.log(`      - ${appender.getType()}`);
    });
  });
}

// Run the demo
demonstrateLoggingFramework();
