export default {
    /**
     * Checks if feature is on compare list and adds it to the list when star icon gets clicked.
     * @param {Object} gfiFeature - feature
     * @returns {void}
     */
    isFeatureOnCompareList: function ({state, commit, dispatch, getters}, gfiFeature) {
        const {layerId} = gfiFeature;

        commit("setListFull", false);
        if (!getters.isFeatureSelected(gfiFeature) && state.layerFeatures[layerId] === undefined) {
            commit("addFeatureToLayer", gfiFeature);
            commit("setCurrentFeatureName", gfiFeature.properties.Name || gfiFeature.properties.name);
            commit("setSelectedLayer", gfiFeature.layerId);
            for (const feature of state.layerFeatures[layerId]) {
                dispatch("prepareFeatureListToShow", feature);
            }
        }
        else {
            const alertingListFull = {
                "category": "info",
                "content": i18next.t("common:modules.compareFeatures.feedback.limitReached")
            };

            dispatch("Alerting/addSingleAlert", alertingListFull, {root: true});
            commit("setListFull", true);
        }
    },
    /**
     * Removes the feature if star icon is clicked.
     * @param {Object} gfiFeature - feature
     * @returns {void}
     */
    removeFeature: function ({state, commit}, gfiFeature) {
        const features = state.hasMultipleLayers ? state.preparedList[gfiFeature.layerId] : state.preparedList[Object.keys(state.preparedList)[0]];

        commit("removeFeatureFromLists", {features: features, featureId: gfiFeature.featureId, selectedLayer: gfiFeature.layerId});
    },
    /**
     * Removes the feature if element in the table is clicked to remove.
     * @param {Object} idFeature - Feature id.
     * @param {Object} idLayer - Layer id.
     * @returns {void}
     */
    removeFeatureFromTable: function ({state, commit}, {idFeature, idLayer}) {
        const features = state.hasMultipleLayers ? state.preparedList[idLayer] : state.preparedList[Object.keys(state.preparedList)[0]];

        commit("removeFeatureFromLists", {features: features, featureId: idFeature, selectedLayer: idLayer});
    },
    /**
     * prepares the list for rendering using the 'gfiAttributes'
     * one object attribute is created for each feature (column)
     * the feature with the most attributes dictates the number of infos that are shown.
     * @param {object} gfiAttributes -
     * @returns {object[]} list - one object per row
     */
    prepareFeatureListToShow: function ({state, commit}, gfiAttributes) {
        const list = [],
            layerId = parseInt(gfiAttributes.layerId.split("_")[0], 10),
            featureList = state.layerFeatures[layerId],
            lengths = [],
            listHeaders = [],
            listRows = [];
        let payload = {},
            indexOfFeatureWithMostAttributes = "",
            tableData = {},
            visible = true;

        Object.values(featureList).forEach(element => {
            lengths.push(Object.keys(element.properties).length);
        });
        indexOfFeatureWithMostAttributes = lengths.indexOf(Math.max(...lengths));
        Object.keys(featureList[indexOfFeatureWithMostAttributes].properties).forEach(function (key, index) {
            if (key.includes("id")) {
                visible = false;
            }
            const row = {"row-1": key},
                rowHeader = {
                    "name": key,
                    "order": "origin",
                    "index": index,
                    "visible": visible
                };

            featureList.forEach(function (feature) {
                row[feature.featureId] = feature.properties[key];
            });
            list.push(row);

            listHeaders.push(rowHeader);

        });

        featureList.forEach(function (feature) {
            feature.properties.id = feature.featureId;
            feature.properties.idLayer = feature.layerId;
            listRows.push(feature.properties);
        });

        tableData = {
            headers: listHeaders,
            items: listRows
        };

        payload = {
            a: layerId,
            b: list,
            c: tableData
        };
        commit("setHasFeatures", true);
        commit("setList", payload);
    }
};

