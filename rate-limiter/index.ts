// * Q/A:
// * How does the rate limiter will get control over the requests?
// * Do i create request (GET/PUT/POST/PATCH/DELETE) from ratelimiter?
// * Do i decorator over normal requests?
// * How to take care of the order of concurrent requests?

type Task<T> = {
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
};


export class RateLimiterWithoutFIFO {
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

export class RateLimiterWithFIFO {
    private queue: Task<unknown>[] = [];
    private timestamps: number[] = [];
    private timer: ReturnType<typeof setTimeout> | null = null;
    private processing = false;

    constructor(
        private readonly maxRequests: number,
        private readonly windowMs: number
    ) {
        if (maxRequests <= 0 || windowMs <= 0) {
            throw new Error('Invalid rate limiter configuration');
        }
    }

    execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                execute: fn,
                resolve: resolve as (value: unknown) => void,
                reject
            });

            this.processQueue();
        });
    }

    private processQueue(): void {
        if (this.processing || this.timer !== null) return;

        this.processing = true;

        try {
            while (this.queue.length > 0) {
                const now = performance.now();

                // Remove expired timestamps
                this.timestamps = this.timestamps.filter(
                    time => now - time < this.windowMs
                );

                // Check whether another request can start
                if (this.timestamps.length >= this.maxRequests) {
                    const waitTime =
                        this.windowMs - (now - this.timestamps[0]);

                    this.timer = setTimeout(() => {
                        this.timer = null;
                        this.processQueue();
                    }, Math.max(0, waitTime));

                    return;
                }

                // FIFO: always take the first request
                const task = this.queue.shift()!;

                // Reserve a rate-limit slot
                this.timestamps.push(now);

                // Execute without waiting for HTTP completion
                Promise.resolve()
                    .then(() => task.execute())
                    .then(task.resolve)
                    .catch(task.reject);
            }
        } finally {
            this.processing = false;
        }
    }
}
