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
export function readRuleColor (rule) {
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
                color = readRuleColor(rule);

            return match && color !== ""
                ? {attribute: match[1], value: repairEncoding(match[2]), color}
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
    const legend = await fetchLegend(wmsUrl, layerName);

    return legend === "" ? {} : colorMapByAttribute(parseLegendRules(legend));
}

/**
 * Fetches the legend document itself, for callers that want more than the
 * colours out of it - the classes the map draws come from the same answer, so
 * it is fetched once and read twice.
 * @param {String} wmsUrl url of the WMS.
 * @param {String} layerName name of the layer.
 * @returns {Promise<String>} the raw legend, empty when it cannot be had.
 */
export async function fetchLegend (wmsUrl, layerName) {
    if (!wmsUrl || !layerName) {
        return "";
    }

    try {
        const {data} = await axios.get(buildLegendUrl(wmsUrl, layerName), {
            timeout: LEGEND_TIMEOUT,
            responseType: "arraybuffer"
        });

        return decodeLegend(data);
    }
    catch (error) {
        return "";
    }
}

/**
 * Turns the bytes of a legend into text.
 *
 * The services declare `application/json`, which means UTF-8, but some answer
 * in Latin-1 all the same: the rare-soils legend writes "mäßig" that way. Read
 * as UTF-8 it becomes "m\uFFFD\uFFFDig" - and since the value is also the
 * filter of the rule, the request built from it matches **nothing**: 0 features
 * instead of 1301. Decoding strictly and falling back is what keeps that from
 * happening silently.
 * @param {ArrayBuffer|Buffer|String} data the response body.
 * @returns {String} the legend as text.
 */
export function decodeLegend (data) {
    if (typeof data === "string") {
        return data;
    }

    const bytes = new Uint8Array(data);

    try {
        return new TextDecoder("utf-8", {fatal: true}).decode(bytes);
    }
    catch (error) {
        return new TextDecoder("iso-8859-1").decode(bytes);
    }
}

/**
 * Repairs a string that was read in the wrong encoding.
 *
 * The legends mix both: `a_reale_nutzung_bebaute_flaechen_2021` writes its
 * layer title in Latin-1 and its rule names in UTF-8, in one document. Whichever
 * encoding the document is read in, half of it comes out wrong - so the repair
 * has to be per string, not per document.
 *
 * Turning the characters back into bytes and decoding those strictly as UTF-8
 * settles it: "GrÃ¼n" is UTF-8 that was read as Latin-1 and becomes "Grün",
 * while "mäßig" really is Latin-1, does not decode, and is left alone.
 * @param {String} text the string as read.
 * @returns {String} the repaired string.
 */
export function repairEncoding (text) {
    if (typeof text !== "string" || !(/[\u0080-\u00FF]/).test(text) || (/[^\u0000-\u00FF]/).test(text)) {
        return text;
    }

    try {
        return new TextDecoder("utf-8", {fatal: true})
            .decode(Uint8Array.from(text, (character) => character.charCodeAt(0)));
    }
    catch (error) {
        return text;
    }
}

/**
 * Decides which legend attribute describes the analysed one.
 *
 * Either the analysed attribute is the one the map is styled by, or it is its
 * readable counterpart: the services style by a code (`woz`, `typ`) and keep the
 * plain text next to it (`woz_name`, `typklar`). In that case the values still
 * have to be translated - see `needsBridge`.
 * @param {Object} colorMap the colours as {attribute: {value: color}}.
 * @param {String} analysedAttribute the attribute being analysed.
 * @param {String[]} [suffixes=[]] the suffixes a plain-text column is named with.
 * @returns {Object|null} the match as {legendAttribute, needsBridge}.
 */
export function matchLegendAttribute (colorMap, analysedAttribute, suffixes = []) {
    if (!colorMap || !analysedAttribute) {
        return null;
    }

    if (colorMap[analysedAttribute]) {
        return {legendAttribute: analysedAttribute, needsBridge: false};
    }

    for (const base of baseNamesOf(analysedAttribute, suffixes)) {
        if (colorMap[base]) {
            return {legendAttribute: base, needsBridge: true};
        }
    }

    return null;
}

/**
 * The code columns a plain-text column could belong to: `woz_name` may stand
 * for `woz`, `typklar` for `typ`.
 * @param {String} name name of the plain-text column.
 * @param {String[]} suffixes the configured suffixes.
 * @returns {String[]} the possible code columns.
 */
export function baseNamesOf (name, suffixes) {
    return (Array.isArray(suffixes) ? suffixes : [])
        .filter((suffix) => typeof suffix === "string" && suffix !== "" &&
            name.length > suffix.length && name.toLowerCase().endsWith(suffix.toLowerCase()))
        .map((suffix) => name.slice(0, -suffix.length));
}

/**
 * The plain-text columns a code column could have, in configured order.
 * @param {String} name name of the code column.
 * @param {String[]} suffixes the configured suffixes.
 * @returns {String[]} the possible plain-text columns.
 */
export function plainTextNamesOf (name, suffixes) {
    return (Array.isArray(suffixes) ? suffixes : [])
        .filter((suffix) => typeof suffix === "string" && suffix !== "")
        .map((suffix) => `${name}${suffix}`);
}
