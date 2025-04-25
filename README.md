# Low Balance Alerts
This project monitors the balances of Ethereum accounts on configured EVM chains with threshold values.
The alerts will be triggerred slack channel.

![alt text](./images/LowBalanceSlack.png)

## Requirements
This project was created using `bun v1.0.30`. Install [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Config file
Set `BALANCE_ALERT_CONFIG` enviorment variable config file path.

```toml
# config.toml
[slack_api]
url = "<slack-url>"
[[chains]]
# Optimism
chainId = 10 
  # faucet
  [[chains.tokens]]
   # erc20 token address, leave empty for gas token
  token = ""
  # in Unit (Ethers)
  threshold =  "0.00000055" 
  accounts = [ "<address1>" , "<address2>"]
  
  [[chains.tokens]]
  token = ""
  threshold =  "0.00000001"
  accounts = [ "<address1>" , "<address2>"]

[[chains]]
chainId = 534352
 # faucet
 [[chains.tokens]]
  token = ""
  threshold = "0.000018"
  accounts =  [ "<address1>" , "<address2>"]

# ---- Clip ---- 
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