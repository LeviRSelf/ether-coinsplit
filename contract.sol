contract splitter {
  
  address[2] recipients;

  event donation(address _from, uint _amount); 

  function splitter(address[2] _recipients) public {
    recipients = _recipients;
  }

  function getAddresses() constant returns (address[2]) {
    return recipients;
  }

  function donate() public {

    recipients[0].send(msg.value / 2);
    recipients[1].send(msg.value / 2);

  }

}       