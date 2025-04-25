import { parseEther, formatEther, type Address } from "viem";
import { loadConfig } from './utils/config'
import { ClientContainer } from './types/ClientContainer'
import { SlackAlert } from "./types/SlackAlert";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {

    const clients = new Map<string, ClientContainer>();
    const config = await loadConfig(Bun.env.BALANCE_ALERT_CONFIG)
    const slackAlert = new SlackAlert(config.slack_api.url)
    const chainIds = config.chains.map((chain: any) => chain.chainId)

    //Init clients 
    for (const chainId of chainIds) {
        clients.set(chainId, new ClientContainer(chainId))
    }

    while (true) {
        try {
            for (const chain of config.chains) {
                for (const chainEntry of chain.tokens) {
                    const threshold = parseEther(chainEntry.threshold || "0") ?? 0n
                    const token = chainEntry.token as string
                    for (const account of chainEntry.accounts) {

                        let balance: bigint = BigInt(0)

                        if (token.length < 3) {
                            // ETH
                            balance = await clients.get(chain.chainId).getEthBalance(account)
                        } else {
                            // ERC20
                            balance = await clients.get(chain.chainId).getErc20Balance(account, token as Address)
                        }
                        console.log(` Chain: ${chain.chainId} Account: ${account} Token: ${token.length < 3 ? "Gas" : token}  Balance: ${formatEther(balance)} Threshold: ${formatEther(threshold)} \n`);

                        if (threshold > balance) {
                            const msg = `
                        Low Balance Alert  
                            Account : ${account}
                            Token: ${token.length < 3 ? "GAS" : token}
                            Chain : ${chain.chainId}
                            Current balance: ${formatEther(balance)}
                            Threshold: ${formatEther(threshold)}
                        `

                            console.log(msg)

                            await slackAlert.sendAlert(msg)
                        }
                    }
                }
            }


        } catch (err) {
            console.error(err)
        }

        await sleep(120_000);

    }



}

main().catch((err) => console.error(err))