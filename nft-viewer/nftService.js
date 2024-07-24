const axios = require('axios');
const { Web3 } = require('web3'); // Import Web3 library
const { MODE_SEPOLIA_RPC_URL, CONTRACT_ADDRESS, ABI, IPFS_CID} = require('./config');  

const web3 = new Web3(new Web3.providers.HttpProvider(MODE_SEPOLIA_RPC_URL));
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

async function getTokenAttributes(tokenId) {
    try {
        const [traitTypes, values, dna] = await contract.methods.getTokenAttributes(tokenId).call();
        const attributes = traitTypes.map((traitType, index) => ({
            trait_type: traitType,
            value: values[index]
        }));
        return { attributes, dna };
    } catch (error) {
        console.error('Error fetching token attributes:', error);
        throw error;
    }
}

async function fetchTraitImageFromIPFS(traitType, traitValue) {
    const url = `https://gateway.pinata.cloud/ipfs/${IPFS_CID}/${traitType}/${traitValue}.png`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error fetching trait image from IPFS:', error);
        throw error;
    }
}


module.exports = {
    getTokenAttributes,
    fetchTraitImageFromIPFS
};
