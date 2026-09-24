import {generateSimpleGetters} from "@shared/js/utils/generators";
import {getAnalysisConfig} from "../js/analysisConfig";
import {buildCqlFilter} from "../js/wfsAnalysis";
import {matchLegendAttribute} from "../js/legendColors";
import {buildExclusiveFilters} from "../js/legendRules";
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
        // Matched against every attribute, not just the numeric ones: services
        // are inconsistent about this. ua_flaechennutzung declares `flalle` as
        // xsd:double, ua_flaechennutzung_1990 declares the very same column as
        // xsd:string although it holds "17627". Naming a column in
        // `areaAttributes` is a deliberate statement that it carries an area,
        // so it outranks the declared type.
        return matchSuggestions(moduleGetters.selectableAttributes, moduleGetters.settings.areaAttributes);
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
     * The attribute a preset pins for this layer, if the layer really has it.
     *
     * Where it does, the form shows the attribute instead of a select: a preset
     * is re-applied on every layer selection, so a choice made by hand would
     * only last until the next switch. A preset naming an attribute the layer
     * does not have yields null - `preselectAttributes` skips it with a warning,
     * and then the choice is the user's again.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object|null} the attribute or null.
     */
    presetAnalyseAttribute (state, moduleGetters) {
        const configured = moduleGetters.preset?.analyseAttribute;

        if (typeof configured !== "string" || configured.trim() === "") {
            return null;
        }

        const wanted = configured.trim().toLowerCase();

        // Case-insensitive like findAttributeByName in the actions, so a preset
        // need not match the schema's spelling exactly.
        return moduleGetters.selectableAttributes
            .find((attribute) => attribute.name.toLowerCase() === wanted) || null;
    },

    /**
     * The attributes the analysis can run on. A preset narrows this to the one
     * it pins - the select stays, as everywhere else in this form, it just has
     * nothing else to offer.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the attributes to offer.
     */
    analyseAttributeCandidates (state, moduleGetters) {
        return moduleGetters.presetAnalyseAttribute
            ? [moduleGetters.presetAnalyseAttribute]
            : moduleGetters.selectableAttributes;
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
     * Everything that could carry an area: the configured names whatever their
     * declared type, plus every numeric attribute. Used to judge a preset,
     * which may deliberately point at something outside the configured list.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the possible area attributes.
     */
    possibleAreaAttributes (state, moduleGetters) {
        const configured = moduleGetters.suggestedAreaAttributes,
            names = configured.map((attribute) => attribute.name);

        return [
            ...configured,
            ...moduleGetters.numericAttributes.filter((attribute) => !names.includes(attribute.name))
        ];
    },

    /**
     * The attributes offered as the one holding the area.
     *
     * Only attributes named in `areaAttributes` qualify. A numeric column is no
     * evidence of an area: measured across 26 layers of this portal, 15 had no
     * configured area column, and what their numbers held was `importid`
     * ("Schlüssel"), `x` ("X-Koordinate"), `dtv` ("Durchschnittliche tägliche
     * Verkehrsstärke") or a percentage - summing any of them as an area is
     * nonsense, and with a single candidate the select is not even shown.
     *
     * An unusually named column is reached the other way round: by naming it,
     * in `areaAttributes` or in a preset. Both are a deliberate statement that
     * the column carries an area.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object[]} the candidates.
     */
    areaAttributeCandidates (state, moduleGetters) {
        const candidates = [...moduleGetters.suggestedAreaAttributes],
            selected = moduleGetters.possibleAreaAttributes
                .find((attribute) => attribute.name === state.areaAttribute);

        // A preset may name a numeric attribute outside the configured list.
        // The select has to contain whatever is selected, otherwise the browser
        // shows the first option while the state says something else.
        if (selected && !candidates.includes(selected)) {
            candidates.push(selected);
        }

        return candidates;
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
     * The CQL filter describing the area the analysis covers - the area
     * selection alone.
     *
     * The additional filter is left out on purpose: it narrows *what* is
     * counted within the area, not *where* the analysis takes place, and
     * drawing it would show a selection rather than an area.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {String} the CQL filter, empty without an area selection.
     */
    areaCqlFilter (state, moduleGetters) {
        return buildCqlFilter(
            state.filterAttribute,
            state.filterValue,
            Boolean(moduleGetters.attributeByName(state.filterAttribute)?.isNumeric)
        );
    },

    /**
     * Whether all selections needed to run an analysis are made.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Boolean} true if the analysis can be started.
     */
    canAnalyse (state, moduleGetters) {
        const hasSubject = moduleGetters.analysisMethod === "legend" || state.analyseAttribute !== "";

        return hasSubject && (state.mode !== "area" || state.areaAttribute !== "");
    },

    /**
     * What the analysis groups by: the classes the map draws, or one attribute.
     *
     * The legend is the default wherever it describes classes - it is what the
     * user sees. Choosing an attribute in the advanced section takes over.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {String} either "legend" or "attribute".
     */
    analysisMethod (state) {
        return state.analyseAttribute === "" && state.legendClasses.length > 0
            ? "legend"
            : "attribute";
    },

    /**
     * Whether the map's own classes are available for this layer at all.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Boolean} true if the legend describes classes.
     */
    hasLegendClasses (state) {
        return state.legendClasses.length > 0;
    },

    /**
     * The classes with filters that no longer overlap, in the order the legend
     * lists them - which is the order of the printed legend, not of the numbers.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Object[]} the classes ready to be queried.
     */
    exclusiveLegendClasses (state) {
        return buildExclusiveFilters(state.legendClasses);
    },

    /**
     * The colour per class, keyed by the label the legend itself uses - the
     * code, before any readable text is put in its place. Two codes may share a
     * name while the map draws them differently, and only this keeps them apart.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Object} the colours as {classLabel: color}.
     */
    legendColorByClass (state) {
        const colors = {};

        state.legendClasses.forEach((legendClass) => {
            if (legendClass.color) {
                colors[legendClass.label] = legendClass.color;
            }
        });

        return colors;
    },

    /**
     * The colour per class label, so the charts show what the map shows.
     * @param {WfsAnalyzerState} state context state object.
     * @returns {Object} the colours as {label: color}.
     */
    legendClassColors (state) {
        const colors = {};

        state.legendClasses.forEach((legendClass) => {
            const label = state.classNames[legendClass.label] || legendClass.label;

            if (legendClass.color) {
                colors[label] = legendClass.color;
            }
        });

        return colors;
    },

    /**
     * Whether the charts of this layer should take the map's colours. The
     * global setting can be overridden per layer in a preset.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Boolean} true if the legend should be used.
     */
    autoColorEnabled (state, moduleGetters) {
        const fromPreset = moduleGetters.preset?.autoColor;

        return typeof fromPreset === "boolean" ? fromPreset : moduleGetters.settings.autoColor;
    },

    /**
     * Which legend attribute describes the analysed one, if any.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object|null} the match as {legendAttribute, needsBridge}.
     */
    legendMatch (state, moduleGetters) {
        if (!moduleGetters.autoColorEnabled) {
            return null;
        }

        return matchLegendAttribute(state.legendColors, state.analyseAttribute, moduleGetters.settings.nameSuffixes);
    },

    /**
     * The colour per category label of the current result, taken from the map
     * legend. Labels without a colour are left out and fall back to the neutral
     * palette in the charts.
     * @param {WfsAnalyzerState} state context state object.
     * @param {Object} moduleGetters the getters of this module.
     * @returns {Object} the colours as {label: color}.
     */
    categoryColors (state, moduleGetters) {
        if (moduleGetters.analysisMethod === "legend") {
            return moduleGetters.legendClassColors;
        }

        const match = moduleGetters.legendMatch;

        if (!match) {
            return {};
        }

        const colors = state.legendColors[match.legendAttribute] || {},
            byLabel = {};

        Object.entries(colors).forEach(([value, color]) => {
            // Without a bridge the analysed values are the legend values; with
            // one they are the readable names behind those values.
            const label = match.needsBridge ? state.codeNames[value] : value;

            if (label !== undefined && label !== "") {
                byLabel[label] = color;
            }
        });

        return byLabel;
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
