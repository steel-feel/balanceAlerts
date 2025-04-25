import { parse } from 'toml'

export async function loadConfig(path: string = "./config.toml") {
    const configFile = Bun.file(path);
    let config = parse(await configFile.text());
    return config
}