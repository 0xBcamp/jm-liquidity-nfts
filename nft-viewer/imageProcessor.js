const { createCanvas, loadImage } = require('canvas');

async function layerImages(traitImages) {
    const canvas = createCanvas(1000, 1000); // Adjust the size as needed
    const ctx = canvas.getContext('2d');

    for (const imgBuffer of traitImages) {
        const img = await loadImage(imgBuffer);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw images with canvas size
    }

    return canvas.toBuffer();
}

module.exports = { layerImages };
