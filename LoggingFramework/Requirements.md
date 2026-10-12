# Design Logging System
```
Requirements: 
1. Log  level: INFO, ERROR, DEBUG
2. Appenders: FILE, DATABASE, CLOUD
3. A log level can have multiple appenders
4. Mutiple appenders can be used for a single log level
5. Configuration for log levels can be changed at runtime
```

## Actors
1. Application User - ? Not able to think much actors
## Roles
1. Append()/Write()
   1. FileAppender(path)
      1. append(logMsg: string)
   2. CloudAppender(storageAccountConfig: {accountName,secretKey,storagePath})
      1. append(logMsg: string);
   3. DatabaseAppender(dbConfig: {name,hostName,password,port,storageTable})
      1. append(logMsg: string)
2. ConfigureLogLevel(Levels)
3. ConfigureAppendersFor(Level,Appenders)
   
## Entities
1. Logger
2. Appender
3. LogManager - ?
4. AppenderManager - ?
5. LogLevel

## Classes/Interfaces Used
1. Logger
   1. ILogger
      1. write()
      2. getLogLevels()
      3. setLogLevels()
      4. getLogAppenders()
      5. setLogAppenders()
      6. getLogLevelAppenders()
      7. setLogLevelAppenders()
   2. FileLogger
   3. DatabaseLogger
   4. CloudLogger
2. Appender
   1. IAppender
      1. append(msg: string)
      2. getConfig()
      3. setConfig(path: string)
   2. FileAppender
   3. DatabaseAppender
   4. CloudAppender
3. LogManager - ?
   1. ILogManager
   2. FileManager
   3. DatabaseManger
   4. CloudManager
4. AppenderManager - ?
   1. IAppenderManager
   2. FileAppenderManager
   3. DatabaseAppenderManager
   4. CloudAppenderManager
5. LogLevel
   1. ILogLevel
   2. LogLevel

