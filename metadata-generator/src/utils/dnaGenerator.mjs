import { ethers } from 'ethers';
import sha1 from 'sha1';

const rarityDelimiter = '#';

const rarity_config = {
  Mythic: 1,
  Legendary: 6,
  Epic: 15,
  Rare: 31,
  Uncommon: 56,
  Common: 100,
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const cleanName = (_str) => {
  let nameWithoutLayer = _str.split('_').pop();
  let nameWithoutExtension = nameWithoutLayer.slice(0, -4);
  let nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getRarityWeight = (_str) => {
  let weight = capitalizeFirstLetter(_str.slice(0, -4).split(rarityDelimiter).pop());
  if (isNaN(weight)) {
    // Ensure non-number weights appropriately adhere to rarity_config
    if (!rarity_config[weight]) {
      throw new Error(
        `'${weight}' contained in ${_str} is not a valid rarity.` +
        ` Please ensure your weights adhere to rarity_config.`
      );
    }
    let rarity = Object.keys(rarity_config);
    for (let i = 0; i < rarity.length; i++) {
      if (rarity[i] == weight && i == 0) {
        var finalWeight = rarity_config[weight];
      } else if (rarity[i] == weight) {
        let min = rarity_config[rarity[i - 1]];
        let max = rarity_config[rarity[i]];
        var finalWeight = Math.floor(Math.random() * (max - min) + min);
      }
    }
  } else {
    var finalWeight = weight;
  }
  return Number(finalWeight);
};

const getElements = (layer) => {
  return layer.map((i, index) => {
    if (i.includes('-')) {
      throw new Error(`Layer name cannot contain dashes, please fix: ${i}`);
    }
    return {
      id: index,
      name: cleanName(i),
      filename: i,
      weight: getRarityWeight(i),
    };
  });
};

async function generateTraits(layers) {
  const traitTypes = [];
  const values = [];
  const randNum = [];

  const layerNames = Object.keys(layers);

  for (const layer of layerNames) {
    const elements = getElements(layers[layer]);

    let totalWeight = 0;
    elements.forEach((element) => {
      totalWeight += element.weight;
    });

    let random = Math.floor(Math.random() * totalWeight);
    for (let i = 0; i < elements.length; i++) {
      random -= elements[i].weight;
      if (random < 0) {
        traitTypes.push(layer);
        values.push(elements[i].name);
        randNum.push(`${elements[i].id}:${elements[i].filename}`);
        break;
      }
    }
  }

  const dna = sha1(`${randNum.join('-')}`);
  const dnaBytes32 = ethers.hexlify(ethers.zeroPadValue(ethers.getBytes(`0x${dna}`), 32));

  console.log({ traitTypes, values, dnaBytes32 });

  return { traitTypes, values, dnaBytes32 };
}

// const layers = {
//   Body: [
//     '0_Body_ScalesBeta#Common.png',      
//     '0_Body_ScalesForked#Common.png',    
//     '0_Body_ScalesLunate#Common.png',    
//     '0_Body_SmoothBeta#Rare.png',        
//     '0_Body_SmoothForked#Epic.png',      
//     '0_Body_SmoothLunate#Legendary.png'  
//   ],
//   Arms: [
//     '1_Arms_FidlerClaws#Rare.png',       
//     '1_Arms_FinArms#Common.png',
//     '1_Arms_LobsterClaws#Rare.png',      
//     '1_Arms_LureArms#Epic.png',
//     '1_Arms_TentacleArms#Legendary.png', 
//     '1_Arms_TurtleArms#Uncommon.png'     
//   ],
//   Back: [
//     '2_Back_Blowhole#Epic.png',
//     '2_Back_DolphinFin#Uncommon.png',    
//     '2_Back_DorsalFins#Common.png',      
//     '2_Back_SharkFin#Rare.png',
//     '2_Back_StrapOnShark#Legendary.png'  
//   ],
//   Head: [
//     '3_Head_FishHead#Common.png',        
//     '4_Head_AnglerEyes#Mythic.png',      
//     '4_Head_BaseEyes#Common.png',        
//     '4_Head_EyeScar#Uncommon.png',       
//     '4_Head_LobsterEye#Rare.png',        
//     '4_Head_SharkEyes#Epic.png',
//     '4_Head_ThreeEyes#Legendary.png'     
//   ],
//   Legs: [
//     '5_Legs_FinLegs#Common.png',
//     '5_Legs_LobsterLegs#Rare.png',       
//     '5_Legs_LureLegs#Epic.png',
//     '5_Legs_TentacleLegs#Legendary.png', 
//     '5_Legs_TurtleLegs#Mythic.png'       
//   ],
//   Mouth: [
//     '6_Mouth_AnglerMouth#Epic.png',      
//     '6_Mouth_BaseMouth#Common.png',      
//     '6_Mouth_CatfishMouth#Legendary.png',
//     '6_Mouth_SwordfishMouth#Rare.png',   
//     '6_Mouth_TurtleBeak#Mythic.png'      
//   ]
// };

// (async () => {
//   await generateTraits(layers);
// })();

export default generateTraits;
