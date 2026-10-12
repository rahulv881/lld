# Logging Framework - OOP Design

## Requirements Summary
1. Log levels: INFO, ERROR, DEBUG
2. Appenders: FILE, DATABASE, CLOUD
3. A log level can have multiple appenders
4. Multiple appenders can be used for a single log level
5. Configuration for log levels can be changed at runtime

## OOP Design Principles Applied

### 1. **Encapsulation**
- Each class has a single responsibility
- Configuration details are encapsulated within appenders
- Logger manages the logging logic without exposing internal details

### 2. **Abstraction**
- `IAppender` interface abstracts the append operation
- Concrete appenders hide implementation specifics

### 3. **Polymorphism**
- All appenders implement `IAppender` interface
- Logger can work with any appender type without knowing specifics

### 4. **Composition**
- Logger composes LogConfiguration
- LogConfiguration composes appenders (one-to-many relationship)

## Class Structure

### Core Classes

#### 1. **LogLevel** (Enum)
```typescript
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  ERROR = "ERROR"
}
```

#### 2. **IAppender** (Interface)
```typescript
interface IAppender {
  append(logLevel: LogLevel, message: string): void;
  getType(): string;
}
```

#### 3. **FileAppender** (Concrete Class)
- Implements IAppender
- Properties: filePath (string)
- Methods: append(), getType(), getConfig(), setConfig()

#### 4. **DatabaseAppender** (Concrete Class)
- Implements IAppender
- Properties: dbConfig (object with name, hostName, password, port, storageTable)
- Methods: append(), getType(), getConfig(), setConfig()

#### 5. **CloudAppender** (Concrete Class)
- Implements IAppender
- Properties: storageAccountConfig (object with accountName, secretKey, storagePath)
- Methods: append(), getType(), getConfig(), setConfig()

#### 6. **LogConfiguration** (Class)
- Manages mapping between LogLevel and Appenders
- Properties: 
  - levelAppenderMap: Map<LogLevel, Set<IAppender>>
- Methods:
  - addAppender(level: LogLevel, appender: IAppender): void
  - removeAppender(level: LogLevel, appender: IAppender): void
  - getAppenders(level: LogLevel): Set<IAppender>
  - setAppenders(level: LogLevel, appenders: IAppender[]): void
  - getAllLevels(): LogLevel[]
  - clear(): void

#### 7. **Logger** (Main Class)
- Properties:
  - configuration: LogConfiguration
- Methods:
  - log(level: LogLevel, message: string): void
  - info(message: string): void
  - error(message: string): void
  - debug(message: string): void
  - configureAppendersFor(level: LogLevel, appenders: IAppender[]): void
  - getAppendersFor(level: LogLevel): IAppender[]
  - getConfiguration(): LogConfiguration

## Class Relationships

```
Logger
  ├── uses → LogConfiguration
  │           └── manages → Map<LogLevel, Set<IAppender>>
  │                           └── contains → IAppender[]
  │                                           ├── FileAppender
  │                                           ├── DatabaseAppender
  │                                           └── CloudAppender
  │
  └── uses → LogLevel (enum)
```

## Design Patterns Used

### 1. **Strategy Pattern**
- Different appender implementations (File, Database, Cloud) can be swapped at runtime
- All implement the same IAppender interface

### 2. **Composition Pattern**
- Logger composes LogConfiguration
- LogConfiguration composes multiple appenders

### 3. **Factory Pattern** (implicit)
- Appenders are created externally and passed to Logger
- Could be extended with AppenderFactory if needed

## Runtime Configuration Flow

1. User creates appenders (FileAppender, DatabaseAppender, CloudAppender)
2. User creates Logger instance
3. User configures appenders for log levels using `configureAppendersFor()`
4. User logs messages using `info()`, `error()`, `debug()`
5. Logger looks up appenders for the log level from LogConfiguration
6. Logger calls `append()` on all appenders for that level
7. Configuration can be changed at runtime by calling `configureAppendersFor()` again

## Example Usage Flow

```typescript
// 1. Create appenders
const fileAppender = new FileAppender("/var/log/app.log");
const dbAppender = new DatabaseAppender({...});
const cloudAppender = new CloudAppender({...});

// 2. Create logger
const logger = new Logger();

// 3. Configure appenders for levels
logger.configureAppendersFor(LogLevel.INFO, [fileAppender, cloudAppender]);
logger.configureAppendersFor(LogLevel.ERROR, [fileAppender, dbAppender, cloudAppender]);
logger.configureAppendersFor(LogLevel.DEBUG, [fileAppender]);

// 4. Use logger
logger.info("Application started");
logger.error("Failed to connect to database");
logger.debug("Processing request");

// 5. Runtime configuration change
logger.configureAppendersFor(LogLevel.INFO, [fileAppender]); // Remove cloud appender
```

## Key Design Decisions

1. **LogConfiguration as separate class**: Encapsulates the mapping logic, making it testable and reusable
2. **Set<IAppender>**: Prevents duplicate appenders for the same level
3. **IAppender interface**: Allows easy extension with new appender types
4. **Logger as main entry point**: Simple API for application code
5. **Runtime configuration**: Methods support changing configuration without recreating logger
