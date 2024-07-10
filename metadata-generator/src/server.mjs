import express from 'express';
import processEvent from './eventHandler.mjs';
import { contract } from './config.mjs';

const app = express();
const port = process.env.PORT || 3000;

// Listen for events
contract.on('NeedsMetadata', async (contractAddress, tokenId) => {
  await processEvent(contractAddress, tokenId);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
