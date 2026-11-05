// * Q/A:
// * How does the rate limiter will get control over the requests?
// * Do i create request (GET/PUT/POST/PATCH/DELETE) from ratelimiter?
// * Do i decorator over normal requests?

export class RateLimiter {
    private timestamps: number[] = [];

    constructor(
        private maxRequests: number,
        private windowMs: number
    ) {}

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        while (true) {
            const now = Date.now();

            this.timestamps = this.timestamps.filter(
                time => now - time < this.windowMs
            );

            if (this.timestamps.length < this.maxRequests) {
                this.timestamps.push(Date.now());
                break;
            }

            const waitTime =
                this.windowMs - (now - this.timestamps[0]);

            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        return fn();
    }
}