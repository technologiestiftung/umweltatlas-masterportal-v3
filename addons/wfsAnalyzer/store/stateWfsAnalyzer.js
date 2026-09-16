/**
 * User type definition
 * @typedef {Object} WfsAnalyzerState
 * @property {String} description the description that should be shown in the button in the menu.
 * @property {String} icon icon next to the title.
 * @property {String} name displayed as the title.
 * @property {String} type the type of the module used to identify it in the config.
 *
 * @property {String} selectedLayerId id of the layer chosen in the dropdown.
 * @property {String} checkStatus one of "idle", "checking", "available", "unavailable", "error".
 * @property {String} checkedLayerId id of the layer the current result belongs to.
 * @property {String} wfsUrl url of the WFS that publishes the selected layer.
 * @property {Object} featureType the matching feature type as {name, title}.
 * @property {String} reason i18n suffix explaining why no WFS was found.
 * @property {String} errorMessage message of the last failed request.
 *
 * @property {Object[]} attributes attributes of the feature type as {name, type, isGeometry, isNumeric}.
 * @property {String} attributesStatus one of "idle", "loading", "ready", "error".
 *
 * @property {String} filterAttribute attribute behind the area selection, e.g. "bezirk".
 * @property {String} filterValue value the area attribute must have, e.g. "Mitte".
 * @property {String} extraFilterAttribute attribute of the optional additional filter.
 * @property {String} extraFilterValue value of the optional additional filter.
 * @property {Object} valueCache known values per attribute as {attribute: {values, truncated, status}}.
 *
 * @property {String} analyseAttribute attribute whose values are counted or summed, e.g. "nutzung".
 * @property {String} mode either "count" or "area".
 * @property {String} areaAttribute attribute holding the area of a feature, e.g. "flalle".
 *
 * @property {Number} featureCount number of features the current filter matches.
 * @property {String} featureCountStatus one of "idle", "loading", "ready", "error".
 *
 * @property {Object} result the analysis result as {unit, total, categories}.
 * @property {String} analysisStatus one of "idle", "running", "ready", "error".
 * @property {String} analysisError message of the last failed analysis.
 * @property {String} resultView one of "table", "pie".
 */
const state = {
    description: "additional:modules.wfsAnalyzer.description",
    icon: "bi-graph-up",
    name: "additional:modules.wfsAnalyzer.title",
    type: "wfsAnalyzer",

    selectedLayerId: "",
    checkStatus: "idle",
    checkedLayerId: "",
    wfsUrl: "",
    featureType: null,
    reason: "",
    errorMessage: "",

    attributes: [],
    attributesStatus: "idle",

    filterAttribute: "",
    filterValue: "",
    extraFilterAttribute: "",
    extraFilterValue: "",
    valueCache: {},

    analyseAttribute: "",
    mode: "count",
    areaAttribute: "",

    featureCount: null,
    featureCountStatus: "idle",

    result: null,
    analysisStatus: "idle",
    analysisError: "",
    resultView: "table"
};

export default state;
