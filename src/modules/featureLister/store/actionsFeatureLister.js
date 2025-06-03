import {getCenter} from "ol/extent";
import createLayerAddToTreeModule from "@shared/js/utils/createLayerAddToTree";
import tabStatus from "../tabStatus";
import getSpatialSelection from "../getSpatialSelection";

// TODO make Text in alert translatable

export default {

    /**
     * Click event that gets triggered when clicking on a row in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} row information of the selected row
     * @returns {void}
     */
    clickOnFeature ({state, commit, dispatch, getters, rootGetters}, row) {
        if (row) {
            const feature = getters.selectedFeature(row.id),
                featureGeometry = feature.getGeometry(),
                styleObj = getters.getGeometryType?.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine;

            commit("setSelectedRow", row);
            dispatch("switchToDetails");

            if (styleObj && styleObj.zoomLevel) {
                if (featureGeometry && typeof featureGeometry.getType === "function") {
                    if (featureGeometry.getType() === "Point") {
                        dispatch("Maps/zoomToCoordinates", {center: featureGeometry.getCoordinates()}, {root: true});
                    }
                    else {
                        dispatch("Maps/zoomToCoordinates", {center: getCenter(featureGeometry.getExtent())}, {root: true});
                    }
                    dispatch("Maps/setZoom", styleObj.zoomLevel, {root: true});
                }
            }
            if (rootGetters.treeHighlightedFeatures?.active) {
                createLayerAddToTreeModule.createLayerAddToTree(state.layer.id, [feature], rootGetters.treeHighlightedFeatures);
            }
        }
    },
    /**
     * Hover event that gets triggered when hovering over a feature in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {String} row index of the clicked Feature
     * @returns {void}
     */
    hoverOverFeature ({dispatch, getters}, row) {
        if (row && row.id) {
            const feature = getters.selectedFeature(row.id);

            dispatch("highlightFeature", feature);
        }
    },
    /**
     * Highlights a feature depending on its geometryType.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} feature the feature to be highlighted.
     * @returns {void}
     */
    highlightFeature ({state, dispatch, getters, rootGetters}, feature) {
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        const layerConfig = rootGetters.layerConfigById(state.layer.id),
            styleObj = getters.getGeometryType?.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            featureGeometryType = feature.getGeometry().getType(),
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: feature.getId(),
                layer: {id: state.layer.id},
                feature: feature,
                scale: styleObj.image?.scale
            };

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
        if (styleObj.zoomLevel) {
            highlightObject.zoomLevel = styleObj.zoomLevel;
        }
        if (layerConfig && layerConfig.styleId) {
            highlightObject.styleId = layerConfig.styleId;
        }

        highlightObject.highlightStyle = {
            fill: styleObj.fill,
            stroke: styleObj.stroke,
            image: styleObj.image
        };
        dispatch("Maps/highlightFeature", highlightObject, {root: true});
    },
    /**
     * Filters the features of the selected layer based on the drawn geometry.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     */
    filterGfiFeaturesOfLayer: async ({state, commit, dispatch, rootGetters, rootState}) => {
        const layers = rootGetters.visibleLayerConfigs,
            layer = layers.find(l => l.id === state.layer.id),
            selectedFeatures = await getSpatialSelection(state.selectedArea, layer, rootState.Maps.projection.getCode(), dispatch);

        if (selectedFeatures.length === 0) {
            dispatch("Alerting/addSingleAlert", {
                category: "info",
                content: "Keine Feature in der Auswahl gefunden."
            }, {root: true});
        }

        commit("setGfiFeaturesOfLayer", selectedFeatures);
    },
    /**
     * Switches back to the feature list of the selected layer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    switchBackToList ({state, commit}) {
        if (state.layer) {
            commit("setLayerListView", tabStatus.ENABLED);
            commit("setFeatureDetailView", tabStatus.ENABLED);
            commit("setFeatureListView", tabStatus.ACTIVE);
        }
    },
    /**
     * Switches to the feature list of the selected layer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} layer reduced selected layer, only contains name, id and geometryType
     * @returns {void}
     */
    switchToList: async ({state, commit, dispatch}) => {
        if (state.layer) {
            if (state.selectedArea) {
                await dispatch("filterGfiFeaturesOfLayer");
            }
            else {
                commit("setGfiFeaturesOfLayer");
            }
            commit("setLayerListView", tabStatus.ENABLED);
            commit("setFeatureListView", tabStatus.ACTIVE);
            commit("setFeatureDetailView", tabStatus.DISABLED);
            commit("setFeatureCount", state.gfiFeaturesOfLayer.length);
            commit("setShownFeatures", state.gfiFeaturesOfLayer.length < state.maxFeatures ? state.gfiFeaturesOfLayer.length : state.maxFeatures);
        }
    },
    /**
     * Switches to the details list of the selected feature.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToDetails ({state, commit}) {
        if (state.selectedRow !== null) {
            commit("setLayerListView", tabStatus.ENABLED);
            commit("setFeatureListView", tabStatus.ENABLED);
            commit("setFeatureDetailView", tabStatus.ACTIVE);
        }
    },
    /**
     * Switches to the themes list of all visibile layers and resets the featureList and the selectedFeature.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToThemes ({commit, dispatch}) {
        commit("setLayerListView", tabStatus.ACTIVE);
        commit("setFeatureListView", tabStatus.DISABLED);
        commit("setFeatureDetailView", tabStatus.DISABLED);
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        commit("resetToThemeChooser");
    },
    /**
     * Expands the feature list to show more features.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    showMore ({state, commit}) {
        const numberOfFeaturesToShow = state.shownFeatures < state.featureCount - 10 ? state.shownFeatures + 10 : state.featureCount;

        commit("setShownFeatures", numberOfFeaturesToShow);
    }
};

