const { createCanvas, loadImage } = require('canvas');

async function layerImages(traitImages) {
    // Look at the first image in traitImages to determine the size of the canvas
    const firstImage = await loadImage(traitImages[0]);
    const canvas = createCanvas(firstImage.width, firstImage.height);
    const ctx = canvas.getContext('2d');

    for (const imgBuffer of traitImages) {
        const img = await loadImage(imgBuffer);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw images with canvas size
    }

    return canvas.toBuffer();
}

module.exports = { layerImages };
