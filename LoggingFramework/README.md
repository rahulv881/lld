# Logging Framework

A flexible, object-oriented logging framework that supports multiple log levels and appenders with runtime configuration.

## Features

- ✅ Three log levels: INFO, ERROR, DEBUG
- ✅ Three appender types: FILE, DATABASE, CLOUD
- ✅ Multiple appenders per log level
- ✅ Runtime configuration changes
- ✅ Clean OOP design with interfaces and composition

## Architecture

The framework follows Object-Oriented Programming principles:

- **Encapsulation**: Each class has a single responsibility
- **Abstraction**: `IAppender` interface abstracts appender implementations
- **Polymorphism**: All appenders implement the same interface
- **Composition**: Logger composes LogConfiguration, which manages appenders

## Project Structure

```
LoggingFramework/
├── src/
│   ├── LogLevel.ts          # Log level enum
│   ├── IAppender.ts         # Appender interface
│   ├── FileAppender.ts      # File appender implementation
│   ├── DatabaseAppender.ts  # Database appender implementation
│   ├── CloudAppender.ts     # Cloud appender implementation
│   ├── LogConfiguration.ts  # Manages level-to-appender mapping
│   ├── Logger.ts            # Main logger class
│   └── index.ts             # Public exports
├── examples/
│   └── usage.ts             # Usage examples
├── DESIGN.md                # Design documentation
├── Requirements.md          # Requirements document
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### Basic Example

```typescript
import { Logger, LogLevel } from "./src";
import { FileAppender } from "./src/FileAppender";
import { DatabaseAppender } from "./src/DatabaseAppender";
import { CloudAppender } from "./src/CloudAppender";

// 1. Create appenders
const fileAppender = new FileAppender("/var/log/app.log");
const dbAppender = new DatabaseAppender({
  name: "logs_db",
  hostName: "localhost",
  password: "secret",
  port: 5432,
  storageTable: "logs"
});
const cloudAppender = new CloudAppender({
  accountName: "storage-account",
  secretKey: "key",
  storagePath: "logs"
});

// 2. Create logger
const logger = new Logger();

// 3. Configure appenders for log levels
logger.configureAppendersFor(LogLevel.INFO, [fileAppender, cloudAppender]);
logger.configureAppendersFor(LogLevel.ERROR, [fileAppender, dbAppender, cloudAppender]);
logger.configureAppendersFor(LogLevel.DEBUG, [fileAppender]);

// 4. Use logger
logger.info("Application started");
logger.error("An error occurred");
logger.debug("Debug information");

// 5. Runtime configuration change
logger.configureAppendersFor(LogLevel.INFO, [fileAppender]); // Remove cloud appender
```

## Running the Demo

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the demo
npm run start

# Or run both in one command
npm run demo
```

## Design Patterns Used

1. **Strategy Pattern**: Different appender implementations can be swapped
2. **Composition Pattern**: Logger composes LogConfiguration
3. **Interface Segregation**: Clean IAppender interface

## Requirements Coverage

✅ **Requirement 1**: Log levels (INFO, ERROR, DEBUG) - Implemented as enum  
✅ **Requirement 2**: Appenders (FILE, DATABASE, CLOUD) - Three concrete classes  
✅ **Requirement 3**: Multiple appenders per log level - Supported via Set<IAppender>  
✅ **Requirement 4**: Multiple appenders for single log level - Same as requirement 3  
✅ **Requirement 5**: Runtime configuration - `configureAppendersFor()` method  

## Future Enhancements

- Async logging support
- Log formatting/formatting strategies
- Log filtering
- Configuration file support
- Error handling and retry mechanisms
- Log rotation for file appender
