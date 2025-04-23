import { createPublicClient, extractChain, http, formatUnits, getContract, parseUnits } from "viem";
import * as chains from "viem/chains"
import type { Address } from "viem";


export class ClientContainer {
    private client: any 

    constructor(chainId: any) {
        this.client = createPublicClient({
            chain: extractChain({
                chains: Object.values(chains),
                id: chainId,
            }),
            transport: http(),
        });
    }

    async getEthBalance(account: Address): Promise<bigint> {
        return this.client.getBalance({ address: account })
    }

    async getErc20Balance(account: Address, tokenAddress: Address): Promise<bigint> {

        const erc20Contract = getContract({
            address: tokenAddress,
            abi: [
                { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
                {
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
            client: this.client,
        })
        //@ts-ignore
        const balance = await erc20Contract.read.balanceOf([account]) as bigint
         //@ts-ignore
        const decimals = await erc20Contract.read.decimals() as number
        
        const formatedAmt = parseUnits(String(balance), 18 - decimals)
     
        return formatedAmt
    }



}