import {generateSimpleMutations} from "@shared/js/utils/generators";
import stateWfsAnalyzer from "./stateWfsAnalyzer";

const mutations = {
    ...generateSimpleMutations(stateWfsAnalyzer),

    /**
     * Clears the result of a previous WFS check.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {void}
     */
    resetCheck (state) {
        state.checkStatus = "idle";
        state.checkedLayerId = "";
        state.wfsUrl = "";
        state.featureType = null;
        state.reason = "";
        state.errorMessage = "";
    },

    /**
     * Stores the outcome of a WFS lookup.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} payload the payload.
     * @param {String} payload.layerId id of the checked layer.
     * @param {Boolean} payload.hasWfs whether a WFS was found.
     * @param {String} payload.wfsUrl url of the WFS.
     * @param {Object} payload.featureType the matching feature type.
     * @param {String} payload.reason why no WFS was found.
     * @returns {void}
     */
    setCheckResult (state, {layerId, hasWfs, wfsUrl, featureType, reason}) {
        state.checkStatus = hasWfs ? "available" : "unavailable";
        state.checkedLayerId = layerId;
        state.wfsUrl = wfsUrl || "";
        state.featureType = featureType || null;
        state.reason = reason || "";
        state.errorMessage = "";
    },

    /**
     * Stores a failed lookup.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} payload the payload.
     * @param {String} payload.layerId id of the checked layer.
     * @param {String} payload.errorMessage the error message.
     * @returns {void}
     */
    setCheckError (state, {layerId, errorMessage}) {
        state.checkStatus = "error";
        state.checkedLayerId = layerId;
        state.wfsUrl = "";
        state.featureType = null;
        state.reason = "";
        state.errorMessage = errorMessage;
    },

    /**
     * Clears everything belonging to the analysis, i.e. the schema, the
     * selections and the result. Called whenever another layer is picked.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {void}
     */
    resetAnalysis (state) {
        state.attributes = [];
        state.attributesStatus = "idle";
        state.filterAttribute = "";
        state.filterValue = "";
        state.extraFilterAttribute = "";
        state.extraFilterValue = "";
        state.valueCache = {};
        state.analyseAttribute = "";
        state.mode = "count";
        state.areaAttribute = "";
        state.featureCount = null;
        state.featureCountStatus = "idle";
        state.result = null;
        state.analysisStatus = "idle";
        state.analysisError = "";
        state.resultView = "bar";
    },

    /**
     * Remembers what is known about the values of one attribute, so switching
     * back and forth does not ask the service again.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} payload the payload.
     * @param {String} payload.attribute name of the attribute.
     * @param {Object} payload.entry the entry as {values, truncated, status}.
     * @returns {void}
     */
    setValueCacheEntry (state, {attribute, entry}) {
        state.valueCache = {...state.valueCache, [attribute]: entry};
    },

    /**
     * Drops a result that no longer matches the current selections.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {void}
     */
    resetResult (state) {
        state.result = null;
        state.analysisStatus = "idle";
        state.analysisError = "";
    }
};

export default mutations;
