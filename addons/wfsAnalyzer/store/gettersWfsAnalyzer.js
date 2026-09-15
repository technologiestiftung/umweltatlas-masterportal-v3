import {generateSimpleGetters} from "@shared/js/utils/generators";
import {getAnalysisConfig} from "../js/analysisConfig";
import {buildCqlFilter} from "../js/wfsAnalysis";
import stateWfsAnalyzer from "./stateWfsAnalyzer";

/**
 * Orders attribute names by a list of suggestions, keeping the order of the
 * suggestions and ignoring case.
 * @param {Object[]} attributes the available attributes.
 * @param {String[]} suggestions the configured suggestions.
 * @returns {Object[]} the matching attributes in suggestion order.
 */
function matchSuggestions (attributes, suggestions) {
    return suggestions
        .map((suggestion) => attributes.find((attribute) => attribute.name.toLowerCase() === String(suggestion).toLowerCase()))
        .filter((attribute) => attribute !== undefined);
}

const getters = {
    ...generateSimpleGetters(stateWfsAnalyzer),

    /**
     * The layers offered in the dropdown: every subject data layer that is
     * currently switched on in the map, sorted by name. Baselayers are left out
     * because they carry no thematic data to analyse.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @param {Object} rootState the root state.
     * @param {Object} rootGetters the root getters.
     * @returns {Object[]} the selectable layer configurations.
     */
    selectableLayers (state, moduleGetters, rootState, rootGetters) {
        const layers = rootGetters.visibleSubjectDataLayerConfigs || [];

        return [...layers]
            .filter((layer) => layer?.id)
            .sort((layerA, layerB) => String(layerA.name).localeCompare(String(layerB.name)));
    },

    /**
     * The configuration of the layer chosen in the dropdown.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object|null} the layer configuration or null.
     */
    selectedLayer (state, moduleGetters) {
        return moduleGetters.selectableLayers.find((layer) => layer.id === state.selectedLayerId) || null;
    },

    /**
     * Whether the shown result still belongs to the selected layer. Guards the
     * template against showing a stale result after the selection changed.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Boolean} true if the result is up to date.
     */
    hasCurrentResult (state) {
        return state.checkedLayerId !== "" && state.checkedLayerId === state.selectedLayerId;
    },

    /**
     * Whether the selected layer may be analysed.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Boolean} true if a WFS was confirmed for the selected layer.
     */
    isAnalysable (state, moduleGetters) {
        return moduleGetters.hasCurrentResult && state.checkStatus === "available";
    },

    /**
     * The effective add-on settings from config.js.
     * @returns {Object} the settings.
     */
    settings () {
        return getAnalysisConfig();
    },

    /**
     * The configured preset for the selected layer, matched on the exact layer
     * id. Resolved on demand rather than stored, so a preset can never carry
     * over to another layer.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object|null} the preset or null.
     */
    preset (state, moduleGetters) {
        if (state.selectedLayerId === "") {
            return null;
        }

        return moduleGetters.settings.presets
            .find((candidate) => candidate.layerId === state.selectedLayerId) || null;
    },

    /**
     * The qualified feature type name used in the WFS requests.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {String} the type name or an empty string.
     */
    typeName (state) {
        return state.featureType?.name || "";
    },

    /**
     * Attributes that can be picked in the selects, i.e. everything but the
     * geometry.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Object[]} the selectable attributes.
     */
    selectableAttributes (state) {
        return state.attributes.filter((attribute) => !attribute.isGeometry);
    },

    /**
     * Attributes that hold numbers - the candidates for the area attribute.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the numeric attributes.
     */
    numericAttributes (state, moduleGetters) {
        return moduleGetters.selectableAttributes.filter((attribute) => attribute.isNumeric);
    },

    /**
     * Configured filter attributes that the layer actually has. Offered first
     * in the select as suggestions.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the suggested filter attributes.
     */
    suggestedFilterAttributes (state, moduleGetters) {
        return matchSuggestions(moduleGetters.selectableAttributes, moduleGetters.settings.filterAttributes);
    },

    /**
     * All remaining attributes, so the user can filter by something that is
     * not in the suggestion list.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the other attributes.
     */
    otherFilterAttributes (state, moduleGetters) {
        const suggested = moduleGetters.suggestedFilterAttributes.map((attribute) => attribute.name);

        return moduleGetters.selectableAttributes.filter((attribute) => !suggested.includes(attribute.name));
    },

    /**
     * Configured area attributes that the layer actually has and that hold
     * numbers.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the suggested area attributes.
     */
    suggestedAreaAttributes (state, moduleGetters) {
        return matchSuggestions(moduleGetters.numericAttributes, moduleGetters.settings.areaAttributes);
    },

    /**
     * All remaining numeric attributes, so an unusual area field can be used.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the other numeric attributes.
     */
    otherAreaAttributes (state, moduleGetters) {
        const suggested = moduleGetters.suggestedAreaAttributes.map((attribute) => attribute.name);

        return moduleGetters.numericAttributes.filter((attribute) => !suggested.includes(attribute.name));
    },

    /**
     * Looks up an attribute by its technical name.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Function} (name) => the attribute or undefined.
     */
    attributeByName (state, moduleGetters) {
        return (name) => moduleGetters.selectableAttributes.find((attribute) => attribute.name === name);
    },

    /**
     * What is known about the values of an attribute. Cached per attribute, so
     * switching the area selection back and forth costs nothing.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Function} (name) => {values, truncated, status}.
     */
    valuesFor (state) {
        return (name) => state.valueCache[name] || {values: [], truncated: false, status: "idle"};
    },

    /**
     * The attributes offered as an area to restrict the analysis to - the
     * configured suggestions the layer actually has.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the area attributes.
     */
    areaFilterAttributes (state, moduleGetters) {
        return moduleGetters.suggestedFilterAttributes;
    },

    /**
     * Attributes offered in the optional additional filter: everything that is
     * not already used for the area selection.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the remaining attributes.
     */
    extraFilterAttributes (state, moduleGetters) {
        return moduleGetters.selectableAttributes
            .filter((attribute) => attribute.name !== state.filterAttribute);
    },

    /**
     * All attributes that could hold an area.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the candidates.
     */
    areaAttributeCandidates (state, moduleGetters) {
        return [...moduleGetters.suggestedAreaAttributes, ...moduleGetters.otherAreaAttributes];
    },

    /**
     * Whether analysing by area is possible at all for this layer.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Boolean} true if the layer has an attribute that could hold an area.
     */
    canAnalyseByArea (state, moduleGetters) {
        return moduleGetters.areaAttributeCandidates.length > 0;
    },

    /**
     * Whether the user has to be asked which attribute holds the area. With a
     * single candidate the choice is made automatically and the select is not
     * shown at all.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Boolean} true if more than one candidate exists.
     */
    needsAreaAttributeChoice (state, moduleGetters) {
        return moduleGetters.areaAttributeCandidates.length > 1;
    },

    /**
     * The CQL filter for the current selections. The area selection and the
     * additional filter are combined, so both restrict the analysis.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {String} the CQL filter.
     */
    cqlFilter (state, moduleGetters) {
        return [
            [state.filterAttribute, state.filterValue],
            [state.extraFilterAttribute, state.extraFilterValue]
        ]
            .map(([name, value]) => buildCqlFilter(name, value, Boolean(moduleGetters.attributeByName(name)?.isNumeric)))
            .filter((part) => part !== "")
            .join(" AND ");
    },

    /**
     * Whether all selections needed to run an analysis are made.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Boolean} true if the analysis can be started.
     */
    canAnalyse (state) {
        return state.analyseAttribute !== "" &&
            (state.mode !== "area" || state.areaAttribute !== "");
    },

    /**
     * Whether the current filter matches more features than configured as
     * comfortable. The analysis is still allowed, but the user is warned.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Boolean} true if the result set is large.
     */
    exceedsMaxFeatures (state, moduleGetters) {
        return typeof state.featureCount === "number" &&
            state.featureCount > moduleGetters.settings.maxFeatures;
    }
};

export default getters;
