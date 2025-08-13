import { loadConfig } from './utils/config';
import { ClientManager } from './services/ClientManager';
import { AlertOrchestrator } from './services/AlertOrchestrator';
import { Scheduler } from './utils/scheduler';

async function main() {
    // Load configuration
    const config = await loadConfig(Bun.env.BALANCE_ALERT_CONFIG);
    
    // Initialize client manager
    const chainIds = config.chains.map((chain: any) => chain.chainId);
    const clientManager = new ClientManager(chainIds);
    
    // Initialize alert orchestrator
    const alertOrchestrator = new AlertOrchestrator(
        clientManager.getClients(),
        config,
        config.slack_api.url
    );
    
    // Initialize scheduler
    const scheduler = new Scheduler(120_000); // 2 minutes
    
    // Start the monitoring loop
    console.log('Starting balance monitoring service...');
    await scheduler.runPeriodically(async () => {
        await alertOrchestrator.processAllChains();
    });
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});