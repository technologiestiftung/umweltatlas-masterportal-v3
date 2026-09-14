import {checkWfsForLayer} from "../js/wfsLookup";
import {analyseByArea, analyseByCount, fetchAttributes, fetchDistinctValues, fetchFeatureCount} from "../js/wfsAnalysis";

/**
 * Counter used to discard responses of requests the user has already moved
 * past. Every long running action takes a token and only writes its result if
 * the token is still the current one.
 * @type {Number}
 */
let requestToken = 0;

/**
 * Reads a preset field. getAnalysisConfig normalizes the presets, but this must
 * not throw on a hand-built one either - a throw while preselecting would
 * surface to the user as "the attributes could not be loaded".
 * @param {*} value the configured value.
 * @returns {String} the trimmed value or an empty string.
 */
function readPresetField (value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Finds an attribute by name, ignoring case, so a preset does not have to match
 * the schema's spelling exactly.
 * @param {Object[]} candidates the attributes to search.
 * @param {String} name the configured name.
 * @returns {Object|undefined} the matching attribute.
 */
function findAttributeByName (candidates, name) {
    return candidates.find((attribute) => attribute.name.toLowerCase() === name.toLowerCase());
}

/**
 * Warns about a preset field that does not fit the selected layer. The tool
 * keeps working - the field is simply not applied.
 * @param {String} layerId id of the layer the preset is configured for.
 * @param {String} field name of the preset field.
 * @param {String} value the configured value.
 * @param {String} reason why it was rejected.
 * @returns {void}
 */
function warnAboutPreset (layerId, field, value, reason) {
    console.warn(`wfsAnalyzer: the preset for layer "${layerId}" sets ${field} "${value}", but ${reason}. The setting is ignored.`);
}

const actions = {
    /**
     * Drops a selection that is no longer available, e.g. because the layer was
     * switched off in the map while the tool was open.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @returns {void}
     */
    syncSelection ({state, getters, commit}) {
        if (state.selectedLayerId !== "" && !getters.selectedLayer) {
            commit("setSelectedLayerId", "");
            commit("resetCheck");
            commit("resetAnalysis");
        }
    },

    /**
     * Selects a layer and checks right away whether it is also published as a WFS.
     * @param {Object} context the vuex context.
     * @param {Function} context.commit the commit function.
     * @param {Function} context.dispatch the dispatch function.
     * @param {String} layerId id of the layer to select.
     * @returns {Promise<void>} resolves once the check is finished.
     */
    selectLayer ({commit, dispatch}, layerId) {
        requestToken += 1;
        commit("setSelectedLayerId", layerId);
        commit("resetCheck");
        commit("resetAnalysis");

        if (layerId === "") {
            return Promise.resolve();
        }

        return dispatch("checkWfsAvailability");
    },

    /**
     * Checks whether the selected layer has a WFS counterpart and stores the
     * result. Results that arrive after the selection changed are discarded.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @param {Function} context.dispatch the dispatch function.
     * @returns {Promise<void>} resolves once the result is stored.
     */
    async checkWfsAvailability ({state, getters, commit, dispatch}) {
        const layerConf = getters.selectedLayer,
            layerId = state.selectedLayerId;

        if (!layerConf) {
            return;
        }

        commit("setCheckStatus", "checking");

        // A layer served as WFS needs no lookup at all.
        if (layerConf.typ === "WFS") {
            commit("setCheckResult", {
                layerId,
                hasWfs: true,
                wfsUrl: layerConf.url,
                featureType: {name: layerConf.featureType || layerConf.id, title: layerConf.name},
                reason: "ok"
            });
            await dispatch("loadAttributes");
            return;
        }

        try {
            const result = await checkWfsForLayer(layerConf);

            if (state.selectedLayerId !== layerId) {
                return;
            }

            commit("setCheckResult", {layerId, ...result});

            if (result.hasWfs) {
                await dispatch("loadAttributes");
            }
        }
        catch (error) {
            if (state.selectedLayerId !== layerId) {
                return;
            }

            commit("setCheckError", {layerId, errorMessage: error.message});
        }
    },

    /**
     * Reads the attributes of the confirmed feature type, so the selects can be
     * filled. A matching area attribute is preselected if the layer has one.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @param {Function} context.dispatch the dispatch function.
     * @returns {Promise<void>} resolves once the attributes are stored.
     */
    async loadAttributes ({state, getters, commit, dispatch}) {
        const token = ++requestToken,
            layerId = state.selectedLayerId,
            {wfsUrl} = state,
            {typeName} = getters;

        if (wfsUrl === "" || typeName === "") {
            return;
        }

        commit("setAttributesStatus", "loading");

        try {
            const attributes = await fetchAttributes(wfsUrl, typeName);

            if (token !== requestToken || layerId !== state.selectedLayerId) {
                return;
            }

            commit("setAttributes", attributes);
            dispatch("preselectAttributes");
            commit("setAttributesStatus", "ready");
        }
        catch (error) {
            if (token !== requestToken || layerId !== state.selectedLayerId) {
                return;
            }

            commit("setAttributesStatus", "error");
            return;
        }

        // Outside the try, so a failure here cannot be mistaken for a schema
        // that could not be loaded.
        await dispatch("refreshFeatureCount");
    },

    /**
     * Prefills the selects for the freshly loaded layer: first from a preset
     * configured for this layer id, then - for anything the preset does not
     * cover - from the suggested area attribute.
     *
     * Preset fields are matched against the attributes the layer really has and
     * the layer's own spelling is stored, because the raw name goes into the WFS
     * requests. A field that does not fit is skipped with a warning instead of
     * breaking the tool.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @returns {void}
     */
    preselectAttributes ({state, getters, commit}) {
        const {preset} = getters;

        if (preset) {
            const filterAttribute = readPresetField(preset.filterAttribute),
                analyseAttribute = readPresetField(preset.analyseAttribute),
                areaAttribute = readPresetField(preset.areaAttribute);

            if (filterAttribute !== "") {
                const match = findAttributeByName(getters.selectableAttributes, filterAttribute);

                if (match) {
                    commit("setFilterAttribute", match.name);
                    // Same invariant as selectFilterAttribute: a filter value
                    // never outlives the attribute it belonged to.
                    commit("setFilterValue", "");
                    commit("setFilterValues", []);
                    commit("setFilterValuesStatus", "idle");
                    commit("setFilterValuesTruncated", false);
                }
                else {
                    warnAboutPreset(preset.layerId, "filterAttribute", filterAttribute, "the layer has no such attribute");
                }
            }

            if (analyseAttribute !== "") {
                const match = findAttributeByName(getters.selectableAttributes, analyseAttribute);

                if (match) {
                    commit("setAnalyseAttribute", match.name);
                }
                else {
                    warnAboutPreset(preset.layerId, "analyseAttribute", analyseAttribute, "the layer has no such attribute");
                }
            }

            if (areaAttribute !== "") {
                const match = findAttributeByName(getters.numericAttributes, areaAttribute);

                if (match) {
                    commit("setAreaAttribute", match.name);
                }
                else {
                    warnAboutPreset(preset.layerId, "areaAttribute", areaAttribute, "the layer has no such numeric attribute");
                }
            }
        }

        // Fallback for every layer without a usable preset area attribute.
        if (state.areaAttribute === "") {
            const [suggestedArea] = getters.suggestedAreaAttributes;

            if (suggestedArea) {
                commit("setAreaAttribute", suggestedArea.name);
            }
        }

        // Last, because analysing by area only makes sense once an area
        // attribute is known.
        if (readPresetField(preset?.mode) === "area") {
            if (state.areaAttribute === "") {
                warnAboutPreset(preset.layerId, "mode", "area", "the layer has no attribute holding an area");
            }
            else {
                commit("setMode", "area");
            }
        }
    },

    /**
     * Sets the filter attribute and clears everything derived from it.
     * @param {Object} context the vuex context.
     * @param {Function} context.commit the commit function.
     * @param {Function} context.dispatch the dispatch function.
     * @param {String} attributeName name of the attribute, may be empty.
     * @returns {Promise<void>} resolves once the feature count is refreshed.
     */
    selectFilterAttribute ({commit, dispatch}, attributeName) {
        commit("setFilterAttribute", attributeName);
        commit("setFilterValue", "");
        commit("setFilterValues", []);
        commit("setFilterValuesStatus", "idle");
        commit("setFilterValuesTruncated", false);
        commit("resetResult");

        return dispatch("refreshFeatureCount");
    },

    /**
     * Sets the filter value and refreshes the feature count.
     * @param {Object} context the vuex context.
     * @param {Function} context.commit the commit function.
     * @param {Function} context.dispatch the dispatch function.
     * @param {String} value the value to filter for.
     * @returns {Promise<void>} resolves once the feature count is refreshed.
     */
    selectFilterValue ({commit, dispatch}, value) {
        commit("setFilterValue", value);
        commit("resetResult");

        return dispatch("refreshFeatureCount");
    },

    /**
     * Loads the distinct values of the filter attribute. The service offers no
     * DISTINCT, so this transfers one property for every feature - which is why
     * it is triggered explicitly by the user and the feature count is shown
     * beforehand.
     *
     * This is a convenience only: some attributes of large layers make the
     * service answer with a 502, so a failure is not treated as an error of the
     * analysis. The value can always be typed in by hand instead.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @returns {Promise<void>} resolves once the values are stored.
     */
    async loadFilterValues ({state, getters, commit}) {
        const token = ++requestToken,
            {wfsUrl, filterAttribute} = state,
            {typeName} = getters,
            attribute = getters.selectableAttributes
                .find((candidate) => candidate.name === filterAttribute);

        if (filterAttribute === "") {
            return;
        }

        commit("setFilterValuesStatus", "loading");
        commit("setFilterValuesTruncated", false);

        try {
            const {values, truncated} = await fetchDistinctValues(wfsUrl, typeName, filterAttribute, {
                isNumeric: Boolean(attribute?.isNumeric),
                limit: getters.settings.maxFilterValues
            });

            if (token !== requestToken) {
                return;
            }

            commit("setFilterValues", values);
            commit("setFilterValuesTruncated", truncated);
            commit("setFilterValuesStatus", "ready");
        }
        catch (error) {
            if (token !== requestToken) {
                return;
            }

            commit("setFilterValuesStatus", "error");
        }
    },

    /**
     * Asks the service how many features the current filter matches. This is a
     * hits-only request, so it transfers no features and can be repeated after
     * every change of the filter.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @returns {Promise<void>} resolves once the count is stored.
     */
    async refreshFeatureCount ({state, getters, commit}) {
        const token = ++requestToken,
            {wfsUrl} = state,
            {typeName, cqlFilter} = getters;

        if (wfsUrl === "" || typeName === "") {
            return;
        }

        commit("setFeatureCountStatus", "loading");

        try {
            const count = await fetchFeatureCount(wfsUrl, typeName, cqlFilter);

            if (token !== requestToken) {
                return;
            }

            commit("setFeatureCount", count);
            commit("setFeatureCountStatus", "ready");
        }
        catch (error) {
            if (token !== requestToken) {
                return;
            }

            commit("setFeatureCount", null);
            commit("setFeatureCountStatus", "error");
        }
    },

    /**
     * Switches between counting features and summing their area.
     * @param {Object} context the vuex context.
     * @param {Function} context.commit the commit function.
     * @param {String} mode either "count" or "area".
     * @returns {void}
     */
    selectMode ({commit}, mode) {
        commit("setMode", mode);
        commit("resetResult");
    },

    /**
     * Runs the analysis with the current selections. Counting uses
     * GetPropertyValue, the area analysis GetFeature limited to two properties -
     * in both cases no geometries are transferred.
     * @param {Object} context the vuex context.
     * @param {Object} context.state the state of this module.
     * @param {Object} context.getters the getters of this module.
     * @param {Function} context.commit the commit function.
     * @returns {Promise<void>} resolves once the result is stored.
     */
    async runAnalysis ({state, getters, commit}) {
        const token = ++requestToken,
            {wfsUrl, analyseAttribute, areaAttribute, mode} = state,
            {typeName, cqlFilter} = getters;

        if (!getters.canAnalyse) {
            return;
        }

        commit("setAnalysisStatus", "running");
        commit("setAnalysisError", "");

        try {
            const request = {wfsUrl, typeName, attribute: analyseAttribute, cqlFilter},
                result = mode === "area"
                    ? await analyseByArea({...request, areaAttribute})
                    : await analyseByCount(request);

            if (token !== requestToken) {
                return;
            }

            commit("setResult", result);
            commit("setAnalysisStatus", "ready");
        }
        catch (error) {
            if (token !== requestToken) {
                return;
            }

            commit("setResult", null);
            commit("setAnalysisStatus", "error");
            commit("setAnalysisError", error.message);
        }
    }
};

export default actions;
