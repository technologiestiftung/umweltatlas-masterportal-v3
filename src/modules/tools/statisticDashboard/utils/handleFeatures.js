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
 * Styles the features by values in the statistics.
 * The number of colors in the scheme indicates the number of classes for the styling.
 * @param {ol/Feature[]} features - The features that are styled.
 * @param {Object} statisticData - The statistic whose values are visualized.
 * @param {Number[]} colorScheme - The color scheme used for styling.
 * @param {String} date - The date for which the values are visualized
 * @param {String} regionKey - The key to the region in the feature.
 * @returns {void}
 */
function styleFeaturesByStatistic (features, statisticData, colorScheme, date, regionKey) {
    if (!Array.isArray(features) || !Array.isArray(colorScheme)) {
        return;
    }

    const statisticsValues = getStatisticValuesByDate(statisticData, date),
        minStatisticValue = Math.min(...statisticsValues),
        maxStatisticValue = Math.max(...statisticsValues),
        stepValues = calcStepValues(minStatisticValue, maxStatisticValue, colorScheme.length);

    Object.keys(statisticData).forEach((region) => {
        const index = closestIndex(stepValues, statisticData[region][date]),
            foundFeature = features.find(feature => feature.get(regionKey) === region);

        if (!foundFeature) {
            return;
        }
        foundFeature.setStyle(() => {
            const defaultColor = [255, 255, 255, 0.9],
                fillColorScheme = typeof colorScheme[index] !== "undefined" ? colorScheme[index] : defaultColor;

            return new Style({
                fill: new Fill({
                    color: fillColorScheme
                }),
                stroke: new Stroke({
                    color: [166, 166, 166, 1],
                    width: 1
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
 * Gets the values of all regions of one statistic from the given date.
 * @param {Object} statistic - The statistic.
 * @param {String} date - The key of the date value.
 * @returns {String[]} The values.
 */
function getStatisticValuesByDate (statistic, date) {
    return Object.keys(statistic)
        .filter(region => typeof statistic[region][date] === "number")
        .map(region => statistic[region][date]);
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
