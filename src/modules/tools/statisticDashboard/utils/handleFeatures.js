import {Fill, Stroke, Style} from "ol/style.js";

/**
 * Filters the features by the passed key and value.
 * @param {ol/Feature[]} features - The features that are filtered.
 * @param {String} key - The name of the key.
 * @param {*} value - The value to be filtered for.
 * @returns {ol/Feature[]} The filtered features.
 */
function filterFeaturesByKeyValue (features, key, value) {
    if (!Array.isArray(features) || typeof key !== "string" || typeof value === "undefined") {
        return [];
    }

    return features.filter(feature => feature.get(key).split(value).length - 1 === 1);
}

/**
 * Styles the features by value in the statistics.
 * The number of colors in the scheme indicates the number of classes for the styling.
 * @param {ol/Feature[]} features - The features that are styled.
 * @param {String} statisticKey - The key of the statistic.
 * @param {Number[]} colorScheme - The color scheme used for styling.
 * @returns {void}
 */
function styleFeaturesByStatistic (features, statisticKey, colorScheme) {
    if (!Array.isArray(features) || typeof statisticKey !== "string" || !Array.isArray(colorScheme)) {
        return;
    }

    const statisticValues = features.map(feature => feature.get(statisticKey)),
        minStatisticValue = Math.min(...statisticValues),
        maxStatisticValue = Math.max(...statisticValues),
        stepValues = calcStepValues(minStatisticValue, maxStatisticValue, colorScheme.length);

    features.forEach(feat => {
        feat.setStyle((feature) => {
            const index = closestIndex(stepValues, Number(feature.get(statisticKey))),
                defaultColor = [255, 255, 255, 0.9],
                fillColorScheme = typeof colorScheme[index] !== "undefined" ? colorScheme[index] : defaultColor;

            return new Style({
                fill: new Fill({
                    color: fillColorScheme
                }),
                stroke: new Stroke({
                    color: [166, 166, 166, 1],
                    width: 0.5
                })
            });
        });
    });
}

/**
 * Calculates the values for the steps using the min and max values and the number of steps.
 * @param {Number} min - The min value.
 * @param {Number} max - The max value.
 * @param {Number} [steps=5] - The number of steps.
 * @return {Number[]} The calculated values.
 */
function calcStepValues (min, max, steps = 5) {
    if (typeof min !== "number" || typeof max !== "number" || typeof steps !== "number" || steps <= 1) {
        return [0];
    }

    if (min === max) {
        return [min];
    }

    const values = [min],
        step = (max - min) / (steps - 1);

    for (let i = 0; i < steps - 1; i++) {
        values.push(Number((values[i] + step).toFixed(2)));
    }

    return values;
}

/**
 * Finds the closest value in an array for the given value and return its index.
 * @param {Number[]} arr - The array to search in.
 * @param {Number} value - The value for which the closest index is searched.
 * @returns {Number} The index.
 */
function closestIndex (arr, value) {
    if (!Array.isArray(arr) || typeof value !== "number") {
        return -1;
    }

    const differenceArray = arr.map(x => Math.abs(value - x)),
        minNumber = Math.min(...differenceArray),
        index = differenceArray.findIndex(x => x === minNumber);

    return index;
}

export default {
    filterFeaturesByKeyValue,
    styleFeaturesByStatistic,
    calcStepValues,
    closestIndex
};
