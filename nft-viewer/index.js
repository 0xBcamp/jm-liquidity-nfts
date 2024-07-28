const express = require('express');
const { PORT } = require('./config');
const { getTokenAttributes, fetchTraitImageFromIPFS } = require('./nftService');
const { layerImages } = require('./imageProcessor');

const app = express();

// Endpoint to fetch and layer images
app.get('/nft-viewer/:contractAddress/:tokenId', async (req, res) => {
    const { contractAddress, tokenId } = req.params;

    try {
        // Fetch token attributes
        const { attributes, dna, traitCID } = await getTokenAttributes(contractAddress, tokenId);

        // Fetch trait images from IPFS in order
        const traitImages = await Promise.all(
            attributes.map(attr => fetchTraitImageFromIPFS(traitCID, attr.value))
        );

        // Layer the trait images together
        const layeredImage = await layerImages(traitImages);

        // Return the combined image as a PNG
        res.setHeader('Content-Type', 'image/png');
        res.send(layeredImage);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//starts the server on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
