# ether-coinsplit

## Usage:

Install Meteor if needed

```bash
$ curl https://install.meteor.com/ | sh
```

Clone the repo locally.

Within geth (preferably on a private test net), generate 2 new addresses that the contract can use for splitting.

Make sure that `eth.accounts` shows your addresses.

Edit the *ether-coinsplit.js* file, replacing the addresses in the `_recipients` array and save this file.

Navigate to the innermost ether-coinsplit folder

Startup meteor (may need sudo)

```bash
$ meteor
```

If successful, meteor will give you an address similar to this:

```bash
=> App running at: http://localhost:3000/
```

Go there in your browser and the app should load.

First open the web console in your browser and then click the button which says "Click Me"

Once mined, the contract address and ABI should show in the console. You can then use these to hook up to the contract

From within geth, run the following commands to send 2 ether to the contract. These will be split among the 2 addresses:

```
var splitteraddr = 'YOUR_CONTRACT_ADDRESS';

var splitter = eth.contract(ABI_FROM_WEB_CONSOLE).at(splitteraddr);

splitter.donate.sendTransaction({from: web3.eth.coinbase, value:web3.toWei(2,'ether'), gas:3000000});
```