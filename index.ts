import { createPublicClient, extractChain, http, parseEther } from "viem";
import type { Address, PublicClient } from "viem";
import * as chains from "viem/chains"
import { parse as parseToml } from 'toml'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let config: any;

type LowBalanceResponse = {
    error: Boolean,
    message: string
}

async function fetchEthBalance(client: PublicClient, account: Address): Promise<bigint> {
    return client.getBalance({
        address: account
    })
}

async function fetchErc20Balance(client: PublicClient, account: Address, tokenAddress: Address): Promise<bigint> {
    const amount = await client.readContract({
        address: tokenAddress,
        abi: [{
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "type": "function"
        }],
        functionName: 'balanceOf',
        args: [account],
    }) as bigint

    console.log(`${account} Token ${tokenAddress} balance: ${amount}`);

    return amount
}

async function lowBalance(chainId: any, account: Address, tokenAddress: Address, threshold: bigint): Promise<LowBalanceResponse> {
    const chain = extractChain({
        chains: Object.values(chains),
        id: chainId,
    })

    const client = createPublicClient({
        chain: chain,
        transport: http(),
    })
    const balance = tokenAddress.length < 3 ? await fetchEthBalance(client as any, account) : await fetchErc20Balance(client as any, account, tokenAddress)

    const bLowBalance = balance < threshold
    const message = bLowBalance ? `Address: ${account} at Network "${chain.name}" have ${bLowBalance ? "Low" : "Enough"} balance` : "";

    if (message) console.log(message);

    return {
        error: bLowBalance,
        message
    }
}


async function sendAlert(content: string) {
    const SLACK_API = config.slack_api.url

    await fetch(SLACK_API, {
        body: JSON.stringify({
            "icon_emoji": ":fuelpump:",
            "username": "Low Balance Bot",
            "text": content
        }),
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    }).catch(err => console.error(err))
}

async function loadConfig(path: string = "config.toml") {
    const configFile = Bun.file(path);
    let config = parseToml(await configFile.text());

    config.faucet.networks.eth = config.faucet.networks.eth.map((ele: any) => {
        ele.threshold = parseEther(ele.threshold)
        return ele
    })

    return config
}

async function main() {
    try {
        config = await loadConfig()
    } catch (err) {
        throw new Error("Config file not found")
    }

    while (true) {
        try {
            //faucet accounts
            for (var chains of config.faucet.networks.eth) {
                const resp = await lowBalance(chains.chainId, config.faucet.account, "0x", chains.threshold)
                if (resp.error) {
                    await sendAlert(`Faucet ${resp.message}`)
                }
            }

            for (var solver of config.solvers) {
                for (var token of solver.tokens) {
                    const resp = await lowBalance(solver.chainId, solver.account, token.address, token.threshold)
                    if (resp.error) {
                        await sendAlert(`Solver ${solver.name} ${resp.message}`)
                    }
                }
            }

            //TODO: for other networks

        }
        catch (err) {
            console.error(err)
        }

        await sleep(120_000);
    }
    // Run checker for file
}

main().catch((err) => console.error(err))