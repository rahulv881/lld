# Rate Limiter

## Usecases
### WASA Compliance related
```
1. Authentication & Session Rate Limits

These controls protect the identity and entry points of your application. Auditors heavily test these endpoints to prevent threat actors from compromising accounts.
• Brute-Force & Credential Stuffing Prevention: Limits login attempts (e.g., maximum 5 failed attempts per username/IP within 15 minutes).
• OTP & Verification Throttling: Restricts how frequently a user can request or validate an One-Time Password (OTP) to prevent SMS gateway exploitation or verification bypass.
• Password Reset Limitations: Prevents attackers from flooding a user's inbox with reset tokens or scanning for valid accounts via mass reset submissions.

2. Endpoint & Resource-Specific Rate Limits

Not all APIs or app pages are built equally; some consume significantly more backend compute or database resources.
• Volumetric API Rate Limiting: Applied to high-load backend API endpoints (e.g., heavy search functions or report generation) to prevent database resource exhaustion.
• Scraping Prevention: Implemented on sensitive data display pages to stop automated data harvesting or bulk scraping of private information.
• Business-Logic Throttling: Restricts the execution of multi-step transactional workflows to prevent abuse (such as generating thousands of test registrations or duplicate appointment records).

3. Client & Identity-Based Rate Limits

These determine how traffic is grouped and tracked before a restriction is triggered.
• IP-Based Rate Limiting: Restricts the number of requests arriving from a single IP address over a specific window (e.g., maximum 100 requests per 5 minutes per IP) to mitigate localized Denial of Service (DoS) attacks.
• User/Session-Based Rate Limiting: Tracks authenticated application sessions. This ensures that even if an attacker rotates their IP via proxies, their specific user account or session token is throttled when anomalous volume is detected.

4. Concurrency Execution Limits

Unlike time-window throttles (e.g., requests per minute), concurrent limits restrict the number of overlapping active connections open simultaneously.
• Simultaneous Session Clamping: Limits how many concurrent active logins a single user ID can have.
• In-Flight Request Caps: Restricts how many bulk data processing queries a single client can trigger concurrently. This stops slow-rate attacks designed to deliberately keep database connections open until a server runs out of memory.
```


## Classes
```
1. RateLimiter
2. RateLimiterManager
    2.1 RateLimitRequest - *
    2.2 RateLimitResponse - *
3. RuleLoad
4. Rules - *
    4.1 APIRules - *
5. RuleManager - *
5. DocumentParser
6. IRateLimitAlgo - (LeakyBucketAlgo, TokenWindowAlgo ...etc)
7. RedisCache
```

NOTE - * denotes classes missed in design