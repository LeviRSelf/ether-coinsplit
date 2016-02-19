if (Meteor.isClient) {

  Recipients = new Meteor.Collection("recipients", {connection: null});

  for (i=1; i<=10; i++) {
    Recipients.insert({
      number: i,
      address: '',
      share: 0
    });
  }

  Session.set("sourcebox","Contract Source");
  Session.set("varbox","Contract Variables");
  Session.set("abibox","ABI");
  Session.set("resultbox","Results");

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
      Session.set("total",s);
      return s
    },
    notice: function(){
      return Session.get("notice");
    },
    sourcebox: function(){
      return Session.get("sourcebox")
    },
    varbox: function(){
      return Session.get("varbox")
    },
    abibox: function(){
      return Session.get("abibox")
    },
    resultbox: function(){
      return Session.get("resultbox")
    }
  })

  Template.recipient.events({
    'change input': function(event) {
      if (event.target.type == 'number') {
        Recipients.update(this._id, {
          $set: {share: parseFloat(event.target.value)}
        });
      }
    }
  });
  Template.controlbuttons.events({
    'click .generate-contract-btn': function () {

      //Validation
      var addresses = [];
      var shares = [];
      for (i=1; i<=10; i++) {
        var share = Recipients.findOne({number:i}).share;
        if (share !== 0) {
          addresses.push(document.getElementById("addr"+i).value);
          shares.push(share);
        }
      }

      if (Math.abs(Session.get("total") - 100) > 0.001) {
        Session.set("resultbox","Shares must add up to 100.");
      }
      else if (!addresses.every(e => web3.isAddress(e))) {
        Session.set("resultbox","One or more addresses is not a valid ethereum address.");
      }
      else {
        Session.set("resultbox","Contract compiled!");
        var splitterSource = 'contract splitter { address['+addresses.length+'] recipients;  function splitter(address['+addresses.length+'] _recipients) public {   recipients = _recipients;  }   function getAddresses() constant returns (address['+addresses.length+']) {   return recipients;  }   function donate() public {  '
        for (i=0; i<addresses.length; i++) {
          splitterSource += 'recipients['+i+'].send(msg.value * '+shares[i]+' * 1000 / 100000); ';
        }
        splitterSource += ' }} ';
        Session.set("sourcebox",splitterSource);
        var compiledContract = web3.eth.compile.solidity(splitterSource);
        Session.set("compiledContract",compiledContract);
        var abiDefinition = JSON.stringify(compiledContract.splitter.info.abiDefinition);
        Session.set("abibox",abiDefinition);
        Session.set("recipients",addresses);
        Session.set("varbox","_recipients:\n\n"+addresses);
        console.log(splitterSource);
        console.log(compiledContract);
        console.log(abiDefinition);
      }`

    },
    'click .deploy-contract-btn': function () {
      var compiledContract = Session.get("compiledContract");
      var splitterContract = web3.eth.contract(compiledContract.splitter.info.abiDefinition);

      var _recipients = Session.get("recipients");
      var splitter = splitterContract.new(_recipients,{from:web3.eth.accounts[0], data: Session.get("compiledContract").splitter.code, gas: 3000000}, function(e, contract){
        if(!e) {

          if(!contract.address) {
            console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
            Session.set("resultbox", "Contract transaction sent!\n\nTransactionHash: " + contract.transactionHash + "\n\nwaiting to be mined...");

          } else {
            console.log("Contract mined! Address: " + contract.address);
            Session.set("resultbox", "Contract mined!\n\nAddress: " + contract.address);
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
