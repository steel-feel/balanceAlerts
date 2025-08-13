export class Scheduler {
    constructor(private intervalMs: number = 120_000) {}

    async runPeriodically(operation: () => Promise<void>): Promise<void> {
        while (true) {
            try {
                await operation();
            } catch (error) {
                console.error('Error in scheduled operation:', error);
            }

            await this.sleep(this.intervalMs);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    setInterval(ms: number): void {
        this.intervalMs = ms;
    }
}
