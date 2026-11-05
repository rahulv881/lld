import { RateLimiterWithFIFO,  RateLimiterWithoutFIFO } from "./index";

// Allow at most 3 requests per 1000ms window
const limiterWithoutFIFO = new RateLimiterWithoutFIFO(3, 1000);
const limiterWithFIFO = new RateLimiterWithFIFO(3, 1000);

const start = Date.now();

async function fakeRequest(id: number): Promise<string> {
    return `request ${id} done at +${Date.now() - start}ms`;
}

async function main() {


    console.log("********* Rate Limiter without FIFO **********");
    const resultsWithoutFIFO = await Promise.all(
        Array.from({ length: 15 }, (_, i) =>
            limiterWithoutFIFO.execute(async () => {
                console.log('Started:', i + 1);
            })
        )
    );
    
    console.log("********* Rate Limiter with FIFO **********");
    const resultsWithFIFO = await Promise.all(
        Array.from({ length: 15 }, (_, i) =>
            limiterWithFIFO.execute(async () => {
                console.log('Started:', i + 1);
            })
        )
    );

    // return resultsWithoutFIFO;

}

main();
