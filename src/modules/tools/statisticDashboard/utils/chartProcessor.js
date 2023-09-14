import Chart from "chart.js";
import isObject from "../../../../utils/isObject.js";

/**
 * Creates a line chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {HTMLCanvasElement} canvas The canvas to render the chart on.
 * @returns {Chart} The chart.
 */
function createLineChart (topic, preparedData, canvas) {
    const chart = canvas,
        lineChartData = parsePreparedDataToLineChartFormat(preparedData),
        datasets = lineChartData?.datasets,
        labels = lineChartData?.labels;

    return new Chart(chart.getContext("2d"), {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            title: {
                display: true,
                text: topic
            }
        }
    });
}

/**
 * Creates a bar chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {String} direction The direction to render the bar.
 * @param {HTMLElement} canvas The canvas to render the chart on.
 * @returns {Chart} The chart.
 */
function createBarChart (topic, preparedData, direction, canvas) {
    const chart = canvas,
        dataValues = parsePreparedDataToBarChartFormat(preparedData);

    return new Chart(chart.getContext("2d"), {
        type: direction === "horizontal" ? "horizontalBar" : "bar",
        data: {
            labels: Object.keys(preparedData),
            datasets: [{
                label: topic,
                data: dataValues
            }]
        }
    });
}

/**
 * Parses data to line chart format and returns it.
 * @param {Object} preparedData The data.
 * @returns {Object} The parsed data.
 */
function parsePreparedDataToLineChartFormat (preparedData) {
    if (!isObject(preparedData)) {
        return {};
    }
    const datasets = [],
        singleDataObject = Object.values(preparedData)[0];
    let labels = [];

    Object.entries(preparedData).forEach(([region, value]) => {
        const data = {
            fill: false,
            label: region,
            data: Object.values(value)
        };

        datasets.push(data);
    });

    if (isObject(singleDataObject)) {
        labels = Object.keys(singleDataObject);
    }

    return {
        datasets,
        labels
    };
}

/**
 * Parses the already prepared data to the bar chart format and returns it.
 * @param {Object} preparedData The data.
 * @returns {*[]} The values as array.
 */
function parsePreparedDataToBarChartFormat (preparedData) {
    if (!isObject(preparedData)) {
        return [];
    }
    const dataValues = [];

    Object.values(preparedData).forEach(data => {
        if (!isObject(data)) {
            return;
        }
        dataValues.push(Object.values(data)[0]);
    });
    return dataValues;
}

export default {
    createLineChart,
    createBarChart,
    parsePreparedDataToLineChartFormat,
    parsePreparedDataToBarChartFormat
};
