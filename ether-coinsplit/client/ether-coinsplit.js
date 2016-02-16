if (Meteor.isClient) {

  Recipients = new Meteor.Collection("recipients", {connection: null});

  for (i=1; i<=10; i++) {
    var x = Recipients.findOne({number: i});
    if (x == undefined) {
      Recipients.insert({
        number: i,
        address: '',
        placeholder: 'Recipient Address '+i,
        share: 0
      });
    }
  }

  Session.set("notice", undefined);
  Session.set("isConnected", web3.isConnected());
  Session.set("compiledContract", undefined);
  Session.set("total", 0);

  Template.notice.helpers({
    notice: function(){
      return Session.get("notice");
    }
  })

  Template.body.checkConnection = function(){
    Meteor.setTimeout(function(){
      Session.set("isConnected",web3.isConnected());
      Template.body.checkConnection();
    }, 2000)
  }
  Template.body.created = function(){
    Template.body.checkConnection()
  }

  Template.body.helpers({
    hostName: function(){
      url = "http://"
      if(window.location.port){
        return url + window.location.hostname + ":" + window.location.port
      }else{
        return url + window.location.hostname
      }
    },
    notConnected: function(){
      return !Session.get("isConnected")
    },
    recipients: function() {
      return Recipients.find({});
    },
    total: function() {
      var s=0;
      Recipients.find({}).map( function(doc) {s += doc.share} );
      document.getElementById("total").value = s;
    }
  })

  Template.recipient.events({
    'change input': function(event) {
      Recipients.update(this._id, {
        $set: {share: parseFloat(event.target.value)}
      });
    }
  });
  Template.controlbuttons.events({
    'click .generate-contract-btn': function () {
      var splitterSource = 'contract splitter {    address[2] recipients;   event donation(address _from, uint _amount);    function splitter(address[2] _recipients) public {   recipients = _recipients;  }   function getAddresses() constant returns (address[2]) {   return recipients;  }   function donate() public {    recipients[0].send(msg.value / 2);   recipients[1].send(msg.value / 2);   }  } ';
      var compiledContract = web3.eth.compile.solidity(splitterSource);
      Session.set("compiledContract",compiledContract);
      var abiDefinition = JSON.stringify(compiledContract.splitter.info.abiDefinition);
      console.log(splitterSource);
      console.log(compiledContract);
      console.log(abiDefinition);

    },
    'click .deploy-contract-btn': function () {
      var compiledContract = Session.get("compiledContract");
      var splitterContract = web3.eth.contract(compiledContract.splitter.info.abiDefinition);

      var _recipients = ['0x2021cae0729f4319057905478484864c89bd4e2d','0x25f688fcdd634beae8254cc27e9759d400b8ce0d'];

      var splitter = splitterContract.new(_recipients,{from:web3.eth.accounts[0], data: Session.get("compiledContract").splitter.code, gas: 3000000}, function(e, contract){
        if(!e) {

          if(!contract.address) {
            console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
            Session.set("notice", "Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

          } else {
            console.log("Contract mined! Address: " + contract.address);
            Session.set("notice", "Contract mined! Address: " + contract.address + "       ABI: " + JSON.stringify(contract.abi));
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
