import {Fill, Stroke, Style} from "ol/style.js";
import {convertColor} from "../../../shared/js/utils/convertColor";
import isObject from "../../../shared/js/utils/isObject";
import isNumber from "../../../shared/js/utils/isNumber";
import quantile from "../../../shared/js/utils/quantile";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";

/**
 * Filters the features by the passed key and value.
 * @param {ol/Feature[]} features - The features that are filtered.
 * @param {String} key - The name of the key.
 * @param {*} value - The value to be filtered for.
 * @returns {ol/Feature[]} The filtered features.
 */
function filterFeaturesByKeyValue (features, key, value) {
    if (!Array.isArray(features) || features.length === 0 || typeof key !== "string" || typeof value === "undefined") {
        return [];
    }

    return features.filter(feature => feature.get(key)?.split(value)?.length - 1 === 1);
}

/**
 * Styles the features by values in the statistics.
 * The number of colors in the scheme indicates the number of classes for the styling.
 * @param {ol/Feature[]} features - The features that are styled.
 * @param {Object} statisticData - The statistic whose values are visualized.
 * @param {Number[]} colorScheme - The color scheme used for styling.
 * @param {String} date - The date for which the values are visualized
 * @param {String} regionKey - The key to the region in the feature.
 * @param {string} [classificationMode="quantiles"] Method of dividing the data into classes. "quantiles" or "equalIntervals".
 * @returns {void}
 */
function styleFeaturesByStatistic (features, statisticData, colorScheme, date, regionKey, classificationMode = "quantiles") {
    if (!Array.isArray(features) || !Array.isArray(colorScheme)) {
        return;
    }

    const stepValues = getStepValue(statisticData, colorScheme, date, classificationMode);

    Object.keys(statisticData).forEach((region) => {
        const index = closestIndex(stepValues, statisticData[region][date]),
            foundFeature = features.find(feature => feature.get(regionKey) === region);

        styleFeature(foundFeature, colorScheme[index]);
    });
}

/**
 * Sets a feature style as a function.
 * @param {ol/Feature} feature - The feature to style.
 * @param {Number[]} [fillColor = [255, 255, 255, 0.9]] - The fill color.
 * @returns {void}
 */
function styleFeature (feature, fillColor = [255, 255, 255, 0.9]) {
    if (typeof feature?.setStyle !== "function") {
        return;
    }
    feature.setStyle(() => {
        return new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: [166, 166, 166, 1],
                width: 1
            })
        });
    });
}

/**
 * Gets the step value.
 * @param {Object} statisticData - The statistic whose values are visualized.
 * @param {Number[]} colorScheme - The color scheme used for styling.
 * @param {String} date - The date for which the values are visualized
 * @param {string} [classificationMode="quantiles"] - Method of dividing values into classes. "quantiles" or "equalIntervals".
 * @returns {void}
 */
function getStepValue (statisticData, colorScheme, date, classificationMode = "quantiles") {
    const statisticsValues = getStatisticValuesByDate(statisticData, date);

    return calcStepValues(statisticsValues, colorScheme.length, classificationMode);
}

/**
 * Calculates the values for the steps.
 * @param {Number[]} values - The values for which classes are to be defined.
 * @param {Number} [numberOfClasses=5] The number of classes.
 * @param {String} [classificationMode="quantiles"] Method of dividing values into classes. "quantiles" or "equalIntervals".
 * @return {Number[]} The calculated values.
 */
function calcStepValues (values, numberOfClasses = 5, classificationMode = "quantiles") {

    if (!Array.isArray(values)
        || !values.every(e => isNumber(e))
        || !Number.isInteger(numberOfClasses)
        || numberOfClasses < 1
        || !["quantiles", "equalIntervals"].includes(classificationMode)
    ) {
        return [0];
    }

    const
        minValue = Math.min(...values),
        maxValue = Math.max(...values);

    if (minValue === maxValue) {
        return [minValue];
    }

    let result = [];

    if (classificationMode === "equalIntervals") {
        const interval = (maxValue - minValue) / numberOfClasses;

        for (let i = 0; i < numberOfClasses; i++) {
            result.push(minValue + i * interval);
        }
    }
    else if (classificationMode === "quantiles") {

        const sortedValues = [...values].sort((a, b) => a - b);

        result.push(sortedValues[0]);

        for (let i = 1; i < numberOfClasses; i++) {

            const p = 1 / numberOfClasses * i;

            result.push(quantile(sortedValues, p));
        }
        result = [... new Set(result)];
    }

    return result;
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

/**
 * Prepares the legend for polygon style.
 * @param {Object} legendObj The legend object.
 * @param {Object} style The styleObject.
 * @returns {Object} - prepare legendObj
 */
function prepareLegendForPolygon (legendObj, style) {
    if (!isObject(legendObj) || !isObject(style)) {
        return legendObj;
    }
    const fillColor = convertColor(style.polygonFillColor, "rgbString"),
        strokeColor = convertColor(style.polygonStrokeColor, "rgbString"),
        strokeWidth = style.polygonStrokeWidth,
        fillOpacity = style.polygonFillColor?.[3] || 0,
        strokeOpacity = style.polygonStrokeColor[3] || 0;
    let svg = "data:image/svg+xml;charset=utf-8,";

    svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
    svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
    svg += fillColor;
    svg += ";fill-opacity:";
    svg += fillOpacity;
    svg += ";stroke:";
    svg += strokeColor;
    svg += ";stroke-opacity:";
    svg += strokeOpacity;
    svg += ";stroke-width:";
    svg += strokeWidth;
    svg += ";stroke-linecap:";
    svg += "round";
    svg += ";stroke-dasharray:";
    svg += ";'/>";
    svg += "</svg>";

    legendObj.graphic = svg;

    return legendObj;
}

/**
 * Gets the Legend value
 * @param {Object} val - The raw value of legend
 * @returns {Object[]} the legend Value
 */
function getLegendValue (val) {
    if (!isObject(val) || !val?.color || !val?.value) {
        return [];
    }

    if (!Array.isArray(val.color) || !Array.isArray(val.value)) {
        return [];
    }

    if (val.color.length < val.value.length) {
        return [];
    }

    const legengValue = [];

    val.value.forEach((data, index) => {
        if (!isNaN(data) && isFinite(data)) {
            let legendObj,
                style;

            if (index === val.value.length - 1) {
                legendObj = {
                    "name": i18next.t("common:modules.statisticDashboard.legend.from") + " " + thousandsSeparator(Math.round(data))
                };
                style = {
                    "polygonFillColor": val.color[index],
                    "polygonStrokeColor": val.color[index],
                    "polygonStrokeWidth": 3
                };
            }
            else {
                legendObj = {
                    "name": i18next.t("common:modules.statisticDashboard.legend.between", {minimum: thousandsSeparator(Math.round(data)), maximum: thousandsSeparator(Math.round(val.value[index + 1]))})
                };
                style = {
                    "polygonFillColor": val.color[index],
                    "polygonStrokeColor": val.color[index],
                    "polygonStrokeWidth": 3
                };
            }

            legengValue[index] = prepareLegendForPolygon(legendObj, style);
        }
    });

    return legengValue;
}

export default {
    filterFeaturesByKeyValue,
    styleFeaturesByStatistic,
    styleFeature,
    calcStepValues,
    getStepValue,
    getLegendValue,
    closestIndex,
    prepareLegendForPolygon
};
