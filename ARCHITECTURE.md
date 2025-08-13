# Balance Alerts - Modular Architecture

## Overview
This project has been refactored from a monolithic structure to a modular, service-oriented architecture that improves maintainability, testability, and separation of concerns.

## Architecture Components

### 1. Services Layer (`src/services/`)

#### `BalanceChecker`
- **Responsibility**: Core balance checking logic for individual tokens and accounts
- **Features**:
  - Handles both ETH and ERC20 token balance checks
  - Returns structured results with error handling
  - Formats alert messages
- **Dependencies**: `ClientContainer` for blockchain interactions

#### `AlertOrchestrator`
- **Responsibility**: Coordinates the balance checking process across all chains, tokens, and accounts
- **Features**:
  - Processes configuration and orchestrates balance checks
  - Manages the flow of data between services
  - Handles logging and alert triggering
- **Dependencies**: `BalanceChecker`, `SlackAlert`

#### `ClientManager`
- **Responsibility**: Manages blockchain client instances for different chains
- **Features**:
  - Initializes and maintains client connections
  - Provides access to chain-specific clients
  - Handles client lifecycle management
- **Dependencies**: `ClientContainer`

### 2. Utilities Layer (`src/utils/`)

#### `Scheduler`
- **Responsibility**: Handles the main monitoring loop and timing
- **Features**:
  - Configurable intervals
  - Error handling and recovery
  - Clean separation of timing logic from business logic

#### `Config`
- **Responsibility**: Configuration loading and database initialization
- **Features**:
  - TOML configuration parsing
  - Database setup
  - Environment variable handling

### 3. Types Layer (`src/types/`)
- **ClientContainer**: Blockchain client wrapper
- **SlackAlert**: Slack notification service
- **Interfaces**: Type definitions for configuration and results

## Benefits of the New Architecture

### 1. **Separation of Concerns**
- Each service has a single, well-defined responsibility
- Business logic is separated from infrastructure concerns
- Configuration management is centralized

### 2. **Testability**
- Individual services can be unit tested in isolation
- Dependencies can be easily mocked
- Business logic is not tightly coupled to external services

### 3. **Maintainability**
- Code is easier to understand and modify
- Changes to one component don't affect others
- Clear interfaces between components

### 4. **Extensibility**
- New alert types can be added without modifying existing code
- Additional blockchain networks can be easily integrated
- Alert mechanisms can be swapped or extended

### 5. **Error Handling**
- Centralized error handling in the scheduler
- Graceful degradation when individual components fail
- Better logging and debugging capabilities

## Usage Example

```typescript
// Initialize services
const clientManager = new ClientManager(chainIds);
const balanceChecker = new BalanceChecker(clientManager.getClients());
const alertOrchestrator = new AlertOrchestrator(
    clientManager.getClients(),
    config,
    config.slack_api.url
);

// Run monitoring
const scheduler = new Scheduler(120_000);
await scheduler.runPeriodically(async () => {
    await alertOrchestrator.processAllChains();
});
```

## Migration from Old Structure

The old monolithic `index.ts` has been broken down into:
- **Main loop logic** → `Scheduler`
- **Balance checking** → `BalanceChecker`
- **Orchestration** → `AlertOrchestrator`
- **Client management** → `ClientManager`

This makes the code more maintainable and easier to extend with new features.
