import {convertHslToHex, convertHexToHSL} from "./convertColor";

// Function to generate a range of colors from dark to light
function generateDarkToLightRange(startColor, rangeSize = 5) {
    const {h, s, l} = convertHexToHSL(startColor),
        colors = [],
        maxLightness = 90, // Set a maximum lightness less than 100 to avoid white
        step = (maxLightness - l) / (rangeSize - 1); // Adjust lightness increment

    for (let i = 0; i < rangeSize; i++) {
        const lightness = l + i * step, // Increment lightness gradually
            newColor = convertHslToHex(h, s, lightness);

        colors.push(newColor);
    }

    return colors;
}

// Function to generate a range of colors
function generateColorRange(startColor, rangeSize = 5) {
    const hsl = convertHexToHSL(startColor),
        colors = [];

    for (let i = 0; i < rangeSize; i++) {
        const newHue = (hsl.h + i * (360 / rangeSize)) % 360,
            newColor = convertHslToHex(newHue, hsl.s, hsl.l);

        colors.push(newColor);
    }

    return colors;
}

export {
    generateDarkToLightRange,
    generateColorRange
};
