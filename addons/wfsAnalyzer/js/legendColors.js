import axios from "axios";

/**
 * Reads the colours a WMS uses to draw a layer, so a chart of that layer can be
 * coloured the same way instead of inventing its own palette.
 *
 * GeoServer answers `GetLegendGraphic` with JSON as well as with an image. Each
 * rule of that JSON carries the colour and a filter naming the attribute and
 * the value it applies to, e.g. `[woz = '10']` with `fill: "#FFCC65"`.
 * @module addons/wfsAnalyzer/js/legendColors
 */

/**
 * Timeout for the legend request in milliseconds.
 * @type {Number}
 */
const LEGEND_TIMEOUT = 20000;

/**
 * Matches the simple equality filter of a legend rule. Rules with anything
 * else - class breaks, ranges, combinations - describe no single value and are
 * of no use here.
 * @type {RegExp}
 */
const valueFilter = /^\[\s*(\w+)\s*=\s*'?([^'\]]*?)'?\s*\]$/;

/**
 * Builds the JSON legend request for one layer of a WMS.
 * @param {String} wmsUrl url of the WMS.
 * @param {String} layerName name of the layer, as in the layer configuration.
 * @returns {String} the request url.
 */
export function buildLegendUrl (wmsUrl, layerName) {
    const url = new URL(wmsUrl);

    url.search = "";
    url.searchParams.set("service", "WMS");
    url.searchParams.set("version", "1.3.0");
    url.searchParams.set("request", "GetLegendGraphic");
    url.searchParams.set("format", "application/json");
    url.searchParams.set("layer", layerName);

    return url.toString();
}

/**
 * Reads the fill colour of a rule, whatever geometry it draws.
 * @param {Object} rule a legend rule.
 * @returns {String} the colour or an empty string.
 */
function readFill (rule) {
    const symbolizers = Array.isArray(rule?.symbolizers) ? rule.symbolizers : [];

    for (const symbolizer of symbolizers) {
        const painted = symbolizer?.Polygon || symbolizer?.Point || symbolizer?.Line,
            fill = painted?.fill || painted?.stroke;

        if (typeof fill === "string" && fill !== "") {
            return fill;
        }
    }

    return "";
}

/**
 * Turns a legend document into the rules that name a single value.
 * @param {Object|String} legend the parsed legend or its raw text.
 * @returns {Object[]} the rules as {attribute, value, color}.
 */
export function parseLegendRules (legend) {
    let document = legend;

    if (typeof legend === "string") {
        try {
            document = JSON.parse(legend);
        }
        catch (error) {
            return [];
        }
    }

    const entries = Array.isArray(document?.Legend) ? document.Legend : [];

    return entries
        .flatMap((entry) => Array.isArray(entry?.rules) ? entry.rules : [])
        .map((rule) => {
            const match = valueFilter.exec(String(rule?.filter || "").trim()),
                color = readFill(rule);

            return match && color !== ""
                ? {attribute: match[1], value: match[2], color}
                : null;
        })
        .filter((rule) => rule !== null);
}

/**
 * Groups the rules by the attribute they filter on.
 * @param {Object[]} rules the parsed rules.
 * @returns {Object} the colours as {attribute: {value: color}}.
 */
export function colorMapByAttribute (rules) {
    const byAttribute = {};

    rules.forEach(({attribute, value, color}) => {
        if (!byAttribute[attribute]) {
            byAttribute[attribute] = {};
        }
        // The first rule wins: a later one for the same value would only
        // overpaint what the map draws first.
        if (byAttribute[attribute][value] === undefined) {
            byAttribute[attribute][value] = color;
        }
    });

    return byAttribute;
}

/**
 * Fetches the legend of a layer and returns its colours per attribute.
 *
 * The service answers with `content-type: text/html` and in Latin-1, so the
 * titles arrive mangled - but attribute names, values and colours are plain
 * ASCII. Anything unparseable yields no colours rather than an error: charts
 * simply stay neutral then.
 * @param {String} wmsUrl url of the WMS.
 * @param {String} layerName name of the layer.
 * @returns {Promise<Object>} the colours as {attribute: {value: color}}.
 */
export async function fetchLegendColors (wmsUrl, layerName) {
    if (!wmsUrl || !layerName) {
        return {};
    }

    try {
        const {data} = await axios.get(buildLegendUrl(wmsUrl, layerName), {
            timeout: LEGEND_TIMEOUT,
            responseType: "text"
        });

        return colorMapByAttribute(parseLegendRules(data));
    }
    catch (error) {
        return {};
    }
}

/**
 * Decides which legend attribute describes the analysed one.
 *
 * Either the analysed attribute is the one the map is styled by, or it is its
 * readable counterpart: the Flächennutzung services style by a code (`woz`) and
 * keep the plain text next to it (`woz_name`). In that case the values still
 * have to be translated - see `needsBridge`.
 * @param {Object} colorMap the colours as {attribute: {value: color}}.
 * @param {String} analysedAttribute the attribute being analysed.
 * @returns {Object|null} the match as {legendAttribute, needsBridge}.
 */
export function matchLegendAttribute (colorMap, analysedAttribute) {
    if (!colorMap || !analysedAttribute) {
        return null;
    }

    if (colorMap[analysedAttribute]) {
        return {legendAttribute: analysedAttribute, needsBridge: false};
    }

    const withoutSuffix = analysedAttribute.replace(/_name$/, "");

    if (withoutSuffix !== analysedAttribute && colorMap[withoutSuffix]) {
        return {legendAttribute: withoutSuffix, needsBridge: true};
    }

    return null;
}
