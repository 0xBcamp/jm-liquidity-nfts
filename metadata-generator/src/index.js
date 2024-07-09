const express = require('express');
const processEvent = require('./eventHandler');
const { contract } = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// Listen for events
contract.events.YourEventName({
  fromBlock: 'latest'
}, async (error, event) => {
  if (error) {
    console.error(error);
  } else {
    const { contractAddress, tokenId } = event.returnValues;
    await processEvent(contractAddress, tokenId);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
