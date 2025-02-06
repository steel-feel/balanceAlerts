# Low Balance Alerts
This project monitors the balances of Faucet, Solver and VSC accounts, trigger alerts to slack channel.

## Requirements
This project was created using `bun v1.0.30`. Install [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Config file
Configuration file required for service
```toml
[slack_api]
url = "<slack-url>"
[faucet]
account = "<facucet-gas-provider-account>"
[faucet.networks]
[[faucet.networks.eth]]
chainId = <chain-id-e.g. 10>
threshold = "<threshold balance in ETH(unit)>"
...
...
..

```
### Installation
To install dependencies:

```bash
bun install
```

## Usage
To run:

```bash
bun start
```