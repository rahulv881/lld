import { RateLimiter } from "./index";

// Allow at most 3 requests per 1000ms window
const limiter = new RateLimiter(1, 1000);

const start = Date.now();

async function fakeRequest(id: number): Promise<string> {
    return `request ${id} done at +${Date.now() - start}ms`;
}

async function main() {
    const results = await Promise.all(
        Array.from({ length: 7 }, (_, i) =>
            limiter.execute(() => fakeRequest(i + 1)).then(console.log)
        )
    );
    return results;
}

main();
