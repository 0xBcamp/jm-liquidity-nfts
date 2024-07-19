// const crypto = require('crypto');
import crypto from 'crypto';

function generateTraits(layers) {
  /**
   * @Ricky, fetchIPFSData needs to be edited before this can really work
   * as is, this is just copied logic from main engine. You won't even have
   * layer.elements yet. 
   * You also need to incororate the rarity modifier logic, either here or in fetchIPFSData
   */
  const traitTypes = [];
  const values = [];
  const randNum = [];

  layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });

    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      random -= layer.elements[i].weight;
      if (random < 0) {
        traitTypes.push(layer.name);
        values.push(layer.elements[i].filename);
        randNum.push(`${layer.elements[i].id}:${layer.elements[i].filename}`);
        break;
      }
    }
  });

  // Not quite sure how I want to hash this yet. bytes32 makes sense
  const dna = crypto.createHash('sha1').update(randNum.join('-')).digest('hex');

  return { traitTypes, values, dna };
}

// module.exports = generateTraits;
export default generateTraits;
