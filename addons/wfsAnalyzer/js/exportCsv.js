/**
 * Builds the CSV of an analysis result and hands it to the browser.
 * @module addons/wfsAnalyzer/js/exportCsv
 */

/**
 * Separator and decimal mark. German spreadsheet software reads a comma as the
 * decimal mark, so the columns have to be separated by a semicolon.
 * @type {String}
 */
const separator = ";";

/**
 * Quotes a field for CSV: wrap in quotes and double any quote inside. Values
 * come from a service, so they can contain the separator, quotes or newlines.
 * @param {*} value the field value.
 * @returns {String} the quoted field.
 */
export function escapeCsvField (value) {
    return `"${String(value === null || value === undefined ? "" : value).replace(/"/g, "\"\"")}"`;
}

/**
 * Formats a number for a CSV that is meant to be opened in a spreadsheet: no
 * thousands separator, comma as the decimal mark.
 * @param {Number} value the value.
 * @param {Number} [decimals=2] number of decimals.
 * @returns {String} the formatted number.
 */
export function formatCsvNumber (value, decimals = 2) {
    if (!isFinite(value)) {
        return "";
    }

    return value.toFixed(decimals).replace(".", ",");
}

/**
 * Builds the CSV of a result. Every category is written, including the ones the
 * pie chart pools into "other", plus a totals row.
 * @param {Object} params the parameters.
 * @param {Object[]} params.categories the categories as {label, value, share}.
 * @param {Number} params.total sum of all values.
 * @param {Object} params.headers the column headers as {category, value, share, total}.
 * @param {Number} [params.decimals=2] decimals of the value column.
 * @returns {String} the CSV.
 */
export function buildCsv ({categories, total, headers, decimals = 2}) {
    const rows = [
        [headers.category, headers.value, headers.share].map(escapeCsvField).join(separator)
    ];

    categories.forEach((category) => {
        rows.push([
            escapeCsvField(category.label),
            escapeCsvField(formatCsvNumber(category.value, decimals)),
            escapeCsvField(formatCsvNumber(category.share * 100, 1))
        ].join(separator));
    });

    rows.push([
        escapeCsvField(headers.total),
        escapeCsvField(formatCsvNumber(total, decimals)),
        escapeCsvField(formatCsvNumber(100, 1))
    ].join(separator));

    return rows.join("\r\n");
}

/**
 * Turns a name into something safe to use as a file name.
 * @param {String} name the raw name.
 * @returns {String} the sanitized name.
 */
export function toFileName (name) {
    const cleaned = String(name || "")
        .replace(/[^\w\-. ]+/g, "_")
        .trim()
        .replace(/\s+/g, "_");

    return cleaned === "" ? "analyse" : cleaned;
}

/**
 * Offers the CSV as a download. A byte order mark is prepended, without it
 * Excel reads the file as the local code page and mangles the umlauts.
 * @param {String} csv the CSV content.
 * @param {String} fileName name of the file, without extension.
 * @returns {void}
 */
export function downloadCsv (csv, fileName) {
    const blob = new Blob(["﻿", csv], {type: "text/csv;charset=utf-8;"}),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");

    link.href = url;
    link.download = `${toFileName(fileName)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
