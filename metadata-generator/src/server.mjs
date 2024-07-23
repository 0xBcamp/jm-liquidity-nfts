import express from 'express';
import processEvent from './eventHandler.mjs';
import { factoryContract } from './config.mjs';

const app = express();
const port = process.env.PORT || 3000;

// Listen for events
factoryContract.on('NeedsMetadata', async (tokenId, owner, contractAddress, ) => {
  console.log(`NeedsMetadata event received for token ${tokenId} at contract ${contractAddress}. Processing...`);
  await processEvent(contractAddress, tokenId);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
