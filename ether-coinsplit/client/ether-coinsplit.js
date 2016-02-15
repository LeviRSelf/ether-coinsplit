if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  var splitterSource = 'contract splitter {    address[2] recipients;   event donation(address _from, uint _amount);    function splitter(address[2] _recipients) public {   recipients = _recipients;  }   function getAddresses() constant returns (address[2]) {   return recipients;  }   function donate() public {    recipients[0].send(msg.value / 2);   recipients[1].send(msg.value / 2);   }  } ';
  var splitterCompiled = web3.eth.compile.solidity(splitterSource);


  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);

      var _recipients = ['0x2021cae0729f4319057905478484864c89bd4e2d','0x25f688fcdd634beae8254cc27e9759d400b8ce0d'];
      var splitterContract = web3.eth.contract(splitterCompiled.splitter.info.abiDefinition);

      var splitter = splitterContract.new(_recipients,{from:web3.eth.accounts[0], data: splitterCompiled.splitter.code, gas: 3000000}, function(e, contract){
        if(!e) {

          if(!contract.address) {
            console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

          } else {
            console.log("Contract mined! Address: " + contract.address);
            console.log(contract);
            console.log(JSON.stringify(contract.abi));
          }

        }
      })
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
