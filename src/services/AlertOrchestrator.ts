import { BalanceChecker, type BalanceCheckResult } from './BalanceChecker';
import { SlackAlert } from '../types/SlackAlert';
import { ClientContainer } from '../types/ClientContainer';

export interface ChainConfig {
    chainId: string;
    tokens: Array<{
        token: string;
        threshold: string;
        accounts: string[];
    }>;
}

export interface AppConfig {
    chains: ChainConfig[];
    slack_api: {
        url: string;
    };
}

export class AlertOrchestrator {
    private balanceChecker: BalanceChecker;
    private slackAlert: SlackAlert;

    constructor(
        private clients: Map<string, ClientContainer>,
        private config: AppConfig,
        slackUrl: string
    ) {
        this.balanceChecker = new BalanceChecker(clients);
        this.slackAlert = new SlackAlert(slackUrl);
    }

    async processAllChains(): Promise<void> {
        for (const chain of this.config.chains) {
            await this.processChain(chain);
        }
    }

    private async processChain(chain: ChainConfig): Promise<void> {
        for (const tokenEntry of chain.tokens) {
            await this.processToken(chain.chainId, tokenEntry);
        }
    }

    private async processToken(chainId: string, tokenEntry: any): Promise<void> {
        for (const account of tokenEntry.accounts) {
            const result = await this.balanceChecker.checkAccountBalance(
                account,
                tokenEntry.token,
                chainId,
                tokenEntry.threshold
            );

            // Log the result
            this.logBalanceCheck(result);

            // Send alert if needed
            const message = this.balanceChecker.formatBalanceMessage(result);
            if (message) {
                await this.slackAlert.sendAlert(message);
            }
        }
    }

    private logBalanceCheck(result: BalanceCheckResult): void {
        if (result.error) {
            console.error(result.error);
            return;
        }

        const tokenLabel = result.token.length < 3 ? "Gas" : result.token;
        console.log(
            `Chain: ${result.chainId} Account: ${result.account} Token: ${tokenLabel} ` +
            `Balance: ${result.balance} Threshold: ${result.threshold}\n`
        );
    }
}
