import { parse } from 'toml'
import { parseEther } from "viem";

export async function loadConfig(path: string = "config.toml") {
    const configFile = Bun.file(path);
    let config = parse(await configFile.text());

    // config.faucet.networks.eth = config.faucet.networks.eth.map((ele: any) => {
    //     ele.threshold = parseEther(ele.threshold)
    //     return ele
    // })

    return config
}