/**
 * Formatting and grouping helpers shared by the table and the charts.
 * @module addons/wfsAnalyzer/js/formatResult
 */

/**
 * Greys for the charts. Deliberately not a categorical colour scheme: the
 * outlines and layers on the map carry their own colours, and a coloured chart
 * next to them reads as if the two were related. Neutral shades keep the chart
 * about proportions.
 *
 * The ramp is dark to light, so neighbouring slices and bars stay apart; the
 * table and the legend carry the meaning.
 * @type {String[]}
 */
export const chartColors = [
    "#2f3438",
    "#474d52",
    "#5d646a",
    "#737b82",
    "#8a9199",
    "#a0a7ae",
    "#b4bac0",
    "#c7ccd1"
];

/**
 * Returns the shade for a category index.
 * @param {Number} index the index.
 * @returns {String} the colour.
 */
export function getChartColor (index) {
    return chartColors[index % chartColors.length];
}

/**
 * Picks a readable unit for an area given in square metres, so that all rows
 * of one result share the same unit.
 * @param {Number} totalSquareMetres the total area.
 * @returns {Object} the unit as {factor, key}.
 */
export function getAreaUnit (totalSquareMetres) {
    if (totalSquareMetres >= 1000000) {
        return {factor: 1000000, key: "km2"};
    }
    if (totalSquareMetres >= 10000) {
        return {factor: 10000, key: "ha"};
    }

    return {factor: 1, key: "m2"};
}

/**
 * Formats a number for display.
 * @param {Number} value the value.
 * @param {String} [locale="de"] the locale.
 * @param {Number} [maximumFractionDigits=0] maximum number of decimals.
 * @returns {String} the formatted number.
 */
export function formatNumber (value, locale = "de", maximumFractionDigits = 0) {
    return new Intl.NumberFormat(locale, {
        maximumFractionDigits,
        minimumFractionDigits: 0
    }).format(isFinite(value) ? value : 0);
}

/**
 * Formats a share as a percentage. Goes through the same locale as every other
 * number, so a German result does not mix "8,18 km²" with "25.8 %".
 * @param {Number} share the share between 0 and 1.
 * @param {String} [locale="de"] the locale.
 * @returns {String} the formatted percentage, without the sign.
 */
export function formatPercent (share, locale = "de") {
    // Always exactly one decimal, so the column lines up and 100 % reads
    // "100,0 %" like every other row.
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format((isFinite(share) ? share : 0) * 100);
}

/**
 * Reduces a result to the categories shown in a chart: the largest ones are
 * kept, everything else is pooled into one remainder entry. The table shows
 * the full list instead.
 * @param {Object[]} categories the categories as {label, value, share}.
 * @param {Number} maxCategories maximum number of individual categories.
 * @param {String} otherLabel label for the pooled remainder.
 * @returns {Object[]} the categories for the chart.
 */
export function groupCategories (categories, maxCategories, otherLabel) {
    if (!Array.isArray(categories)) {
        return [];
    }
    if (categories.length <= maxCategories) {
        return [...categories];
    }

    const kept = categories.slice(0, maxCategories - 1),
        rest = categories.slice(maxCategories - 1),
        restValue = rest.reduce((sum, category) => sum + category.value, 0),
        restShare = rest.reduce((sum, category) => sum + category.share, 0);

    return [
        ...kept,
        {
            label: otherLabel,
            value: restValue,
            share: restShare,
            isOther: true,
            groupedCount: rest.length
        }
    ];
}
