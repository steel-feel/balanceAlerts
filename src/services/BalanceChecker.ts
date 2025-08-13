import { parseEther, formatEther, type Address, parseUnits, formatUnits } from "viem";
import { ClientContainer } from '../types/ClientContainer';

export interface BalanceCheckResult {
    account: string;
    token: string;
    chainId: string;
    balance: bigint;
    threshold: bigint;
    thresholdDecimals: number;
    isLowBalance: boolean;
    error?: string;
}

export class BalanceChecker {
    constructor(private clients: Map<string, ClientContainer>) {}

    async checkAccountBalance(
        account: string,
        token: string,
        chainId: string,
        threshold: string
    ): Promise<BalanceCheckResult> {
        const client = this.clients.get(chainId);
        if (!client) {
            throw new Error(`No client found for chain ${chainId}`);
        }

        let balance: bigint;
        let thresholdDecimals = 18;
        let parsedThreshold: bigint;

        try {
            if (token.length < 3) {
                // ETH/GAS token
                balance = await client.getEthBalance(account as Address);
                parsedThreshold = parseEther(threshold || "0");
            } else {
                // ERC20 token
                const erc20Result = await client.getErc20Balance(account as Address, token as Address);
                balance = erc20Result.value;
                thresholdDecimals = erc20Result.decimals;
                parsedThreshold = parseUnits(threshold, erc20Result.decimals);
            }

            return {
                account,
                token,
                chainId,
                balance,
                threshold: parsedThreshold,
                thresholdDecimals,
                isLowBalance: parsedThreshold > balance
            };
        } catch (error) {
            return {
                account,
                token,
                chainId,
                balance: BigInt(0),
                threshold: BigInt(0),
                thresholdDecimals: 18,
                isLowBalance: false,
                error: `Error fetching balance: ${error}`
            };
        }
    }

    formatBalanceMessage(result: BalanceCheckResult): string | null {
        if (result.error) {
            return `Error fetching balance for ${result.account} on ${result.chainId} of ${result.token.length < 3 ? "GAS" : result.token}: ${result.error}`;
        }

        if (result.isLowBalance) {
            return `
Low Balance Alert  
    Account : ${result.account}
    Token: ${result.token.length < 3 ? "GAS" : result.token}
    Chain : ${result.chainId}
    Current balance: ${formatUnits(result.balance, result.thresholdDecimals)}
    Threshold: ${formatEther(result.threshold)}
`;
        }

        return null;
    }
}
