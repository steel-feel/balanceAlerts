import { ClientContainer } from '../types/ClientContainer';

export class ClientManager {
    private clients: Map<string, ClientContainer> = new Map();

    constructor(private chainIds: string[]) {
        this.initializeClients();
    }

    private initializeClients(): void {
        for (const chainId of this.chainIds) {
            this.clients.set(chainId, new ClientContainer(chainId));
        }
    }

    getClients(): Map<string, ClientContainer> {
        return this.clients;
    }

    getClient(chainId: string): ClientContainer | undefined {
        return this.clients.get(chainId);
    }

    hasClient(chainId: string): boolean {
        return this.clients.has(chainId);
    }
}
