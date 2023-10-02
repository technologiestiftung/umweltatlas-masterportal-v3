import Chart from "chart.js";
import {convertToRgbaString, getCssColorMap} from "../../../../utils/convertColor.js";
import isObject from "../../../../utils/isObject.js";

/**
 * Creates a line chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {HTMLCanvasElement} canvas The canvas to render the chart on.
 * @param {Boolean} renderSimple true if should be rendered as simple chart. Default is false.
 * @returns {Chart} The chart.
 */
function createLineChart (topic, preparedData, canvas, renderSimple = false) {
    const chart = canvas,
        lineChartData = parsePreparedDataToLineChartFormat(preparedData),
        datasets = lineChartData?.datasets,
        labels = lineChartData?.labels,
        config = {
            type: "line",
            data: {
                labels,
                datasets
            },
            options: {
                title: {
                    display: true,
                    text: topic,
                    fontSize: 13,
                    padding: 10
                },
                legend: {
                    position: "right"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

    if (renderSimple) {
        Object.assign(config.options, simpleChartOptions);
    }
    return new Chart(chart.getContext("2d"), config);
}

/**
 * Creates a bar chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {String} direction The direction to render the bar.
 * @param {HTMLElement} canvas The canvas to render the chart on.
 * @param {Boolean} [renderSimple=false] -  true if should be rendered as simple chart.
 * @param {Object[]} [colour = ["#d3d3d3"]] -  The colour to render the bar.
 * @returns {Chart} The chart.
 */
function createBarChart (topic, preparedData, direction, canvas, renderSimple = false, colour = ["#d3d3d3"]) {
    const chart = canvas,
        dataValues = parsePreparedDataToBarChartFormat(preparedData),
        dataColours = getBarChartColours(dataValues, colour),
        config = {
            type: direction === "horizontal" ? "horizontalBar" : "bar",
            data: {
                labels: Object.keys(preparedData),
                datasets: [{
                    label: topic,
                    data: dataValues,
                    borderColor: dataColours,
                    backgroundColor: dataColours
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: topic + " " + getYearFromPreparedData(preparedData),
                    fontSize: 13,
                    padding: 10
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

    if (renderSimple) {
        Object.assign(config.options, simpleChartOptions);
    }
    config.options.scales.xAxes[0].position = direction === "horizontal" ? "top" : "bottom";
    return new Chart(chart.getContext("2d"), config);
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
        singleDataObject = Object.values(preparedData)[0],
        allColors = Object.values(getCssColorMap());
    let labels = [],
        datasetsCount = 0;

    Object.entries(preparedData).forEach(([region, value]) => {
        if (datasetsCount >= allColors.length) {
            datasetsCount = 0;
        }
        const datas = Object.values(value),
            color = convertToRgbaString(allColors[datasetsCount]),
            data = {
                fill: false,
                label: region,
                data: datas,
                borderColor: color,
                backgroundColor: color
            };

        datasets.push(data);
        datasetsCount += 1;
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
/**
 * Parses the already prepared data to the bar chart format and returns it.
 * @param {Object} preparedData The data.
 * @returns {*[]} The values as array.
 */
function getYearFromPreparedData (preparedData) {
    if (!isObject(preparedData)) {
        return "";
    }
    const year = Object.keys(Object.values(preparedData)[0])[0];

    return year;
}
/**
 * Get the colour for the bar chart and returns it.
 * @param {Object} data - The data.
 * @param {Object[]} currentColour - The colours.
 * @returns {Object[]} The values as array.
 */
function getBarChartColours (data, currentColour) {
    if (!Array.isArray(data) && !Array.isArray(currentColour)) {
        return "";
    }
    let colourValue = [];


    if (currentColour.length === 2) {
        colourValue = data.map((value) => value < 0 ? currentColour[0] : currentColour[1]);
    }
    if (currentColour.length === 1) {
        colourValue = currentColour[0];
    }

    return colourValue;
}
const simpleChartOptions = {
    legend: {display: false},
    scales: {
        yAxes: [{
            ticks: {
                maxTicksLimit: 4,
                beginAtZero: true
            }
        }],
        xAxes: [{
            ticks: {
                maxTicksLimit: 4,
                beginAtZero: true
            }
        }]
    }
};

export default {
    createLineChart,
    createBarChart,
    parsePreparedDataToLineChartFormat,
    parsePreparedDataToBarChartFormat,
    getYearFromPreparedData,
    getBarChartColours
};
