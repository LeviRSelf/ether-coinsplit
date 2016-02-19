# ether-coinsplit

## Usage:

Install Meteor if needed

```bash
$ curl https://install.meteor.com/ | sh
```

Clone the repo locally.

Within geth (preferably on a private test net), generate at least 2 addresses that the contract can use for splitting.

Make sure that `eth.accounts` shows your addresses.

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

Enter addresses and shares (from 0 to 100) on the left navbar. When the donate() method in the contract is run, any payments sent to the contract will be split among these addresses using the proportions specified.

Click Generate to compile the contract. If successful, a message should show in the Results box (lower-right) indicating compilation was successful.

Once compilation succeeds, you can click Deploy to push the contract to your network (currently only geth nodes running locally are supported. Mist support is on the todo list.)

The 'Send' button does nothing for now. Soon it will allow sending to existing contracts. For now payments can be sent manually from within a Geth console:

From within Geth, run the following commands to send 2 ether to the contract. These will be split among the addresses you chose. You will need to record the ABI and contract address from the corresponding windows in the app:

```
var splitteraddr = 'YOUR_CONTRACT_ADDRESS';

var splitter = eth.contract(ABI_FROM_WEB_CONSOLE).at(splitteraddr);

splitter.donate.sendTransaction({from: web3.eth.coinbase, value:web3.toWei(2,'ether'), gas:3000000});
```