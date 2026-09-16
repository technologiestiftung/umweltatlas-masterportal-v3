/**
 * Default settings of the wfsAnalyzer add-on. They can be overridden per
 * portal in `config.js` via a `wfsAnalyzer` object, e.g.
 *
 * const Config = {
 *     addons: ["wfsAnalyzer"],
 *     wfsAnalyzer: {
 *         filterAttributes: ["bezirk", "bez", "ortsteil"],
 *         areaAttributes: ["flalle", "flaeche"],
 *         maxFeatures: 50000,
 *         presets: [
 *             {
 *                 layerId: "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
 *                 filterAttribute: "bezirk",
 *                 areaAttribute: "flalle",
 *                 mode: "area"
 *             }
 *         ]
 *     }
 * };
 *
 * Only the keys given in `config.js` are overridden, the rest falls back to
 * the defaults below.
 * @module addons/wfsAnalyzer/js/analysisConfig
 */

/**
 * Attribute names that typically describe the spatial unit a feature belongs
 * to. They are offered as suggestions when choosing what to filter by; the
 * user may still pick any other attribute of the layer.
 * @type {String[]}
 */
export const defaultFilterAttributes = [
    "bezirk",
    "bez",
    "bezirksname",
    "bezname",
    "ortsteil",
    "ot",
    "ortsteilname",
    "prognoseraum",
    "bezirksregion",
    "bzr_name",
    "plr_name",
    "planungsraum",
    "gemeinde",
    "stadtteil",
    "woz_name",
    "grz_name"
];

/**
 * Attribute names that typically hold a precomputed area in square metres.
 * Using such an attribute avoids downloading geometries when analysing by
 * area.
 * @type {String[]}
 */
export const defaultAreaAttributes = [
    "flalle",
    "flaeche",
    "flaeche_qm",
    "fl",
    "area",
    "shape_area",
    "st_area",
    "gesamtflaeche",
    "flae",
    "groesse"
];

/**
 * Number of features above which loading is flagged as expensive. The user is
 * warned but may proceed.
 * @type {Number}
 */
export const defaultMaxFeatures = 50000;

/**
 * Number of categories shown in the charts before the remainder is pooled
 * into one "other" slice. The table always lists every category.
 * @type {Number}
 */
export const defaultMaxChartCategories = 12;

/**
 * Maximum number of filter values collected one by one when the service
 * refuses to hand over the whole column at once. Each value costs one small
 * request, so this bounds both the wait and the number of requests.
 * @type {Number}
 */
export const defaultMaxFilterValues = 50;

/**
 * Whether the charts take their colours from the map legend. Off by default:
 * it only works where the layer is styled per value, and it costs a request.
 * Switch it on per layer in a preset.
 * @type {Boolean}
 */
export const defaultAutoColor = false;

/**
 * Number of legend entries up to which the code-to-name lookup is attempted.
 * Each entry costs one small request; ua_kanalisation_2005 has 242.
 * @type {Number}
 */
export const defaultMaxLegendRules = 40;

/**
 * Reads an optional boolean, keeping "not configured" apart from false.
 * @param {*} value the configured value.
 * @returns {Boolean|null} the value or null.
 */
function readPresetFlag (value) {
    return typeof value === "boolean" ? value : null;
}

/**
 * Reads an optional string field of a preset. Empty and non-string values count
 * as "not configured".
 * @param {*} value the configured value.
 * @returns {String} the trimmed value or an empty string.
 */
function readPresetField (value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Brings the configured presets into a predictable shape. Entries without a
 * usable `layerId` are dropped, unknown modes are ignored. Whether the named
 * attributes actually exist can only be decided once the layer's schema is
 * known, so that check happens in the store.
 * @param {*} presets the configured presets.
 * @returns {Object[]} the normalized presets.
 */
export function normalizePresets (presets) {
    if (!Array.isArray(presets)) {
        return [];
    }

    return presets
        .filter((preset) => preset && typeof preset === "object" && readPresetField(preset.layerId) !== "")
        .map((preset) => {
            const mode = readPresetField(preset.mode);

            return {
                layerId: readPresetField(preset.layerId),
                filterAttribute: readPresetField(preset.filterAttribute),
                areaAttribute: readPresetField(preset.areaAttribute),
                analyseAttribute: readPresetField(preset.analyseAttribute),
                mode: mode === "count" || mode === "area" ? mode : "",
                autoColor: readPresetFlag(preset.autoColor)
            };
        });
}

/**
 * Reads the add-on settings from the portal's `config.js` and fills in the
 * defaults for everything that is not configured.
 * @returns {Object} the effective settings.
 */
export function getAnalysisConfig () {
    // `Config` is the global portal configuration object provided by config.js.
    const portalConfig = typeof Config === "undefined" ? {} : Config,
        settings = portalConfig?.wfsAnalyzer || {};

    return {
        filterAttributes: Array.isArray(settings.filterAttributes) ? settings.filterAttributes : defaultFilterAttributes,
        areaAttributes: Array.isArray(settings.areaAttributes) ? settings.areaAttributes : defaultAreaAttributes,
        maxFeatures: typeof settings.maxFeatures === "number" ? settings.maxFeatures : defaultMaxFeatures,
        maxChartCategories: typeof settings.maxChartCategories === "number" ? settings.maxChartCategories : defaultMaxChartCategories,
        maxFilterValues: typeof settings.maxFilterValues === "number" ? settings.maxFilterValues : defaultMaxFilterValues,
        autoColor: typeof settings.autoColor === "boolean" ? settings.autoColor : defaultAutoColor,
        maxLegendRules: typeof settings.maxLegendRules === "number" ? settings.maxLegendRules : defaultMaxLegendRules,
        presets: normalizePresets(settings.presets)
    };
}
