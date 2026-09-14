/**
 * Formatting and grouping helpers shared by the table and the charts.
 * @module addons/wfsAnalyzer/js/formatResult
 */

/**
 * Categorical colours for the charts. Chosen to stay distinguishable next to
 * each other; the list is cycled if a result has more categories.
 * @type {String[]}
 */
export const chartColors = [
    "#1f6fb4",
    "#e8762c",
    "#4c9f70",
    "#c8452f",
    "#7b5aa6",
    "#8c6239",
    "#d16ba5",
    "#5b8ea6",
    "#a3a533",
    "#2f8f9d",
    "#b04a6a",
    "#6c757d"
];

/**
 * Returns the colour for a category index.
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
