import { parse } from 'toml'
import * as PouchDB from 'pouchdb';


export async function loadConfig(path: string = "./config.toml") {
    const configFile = Bun.file(path);
    let config = parse(await configFile.text());
    return config
}

export async function initDB() {
    const db = new PouchDB('Alerts');
    return db;
}