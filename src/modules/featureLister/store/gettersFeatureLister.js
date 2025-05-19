import {generateSimpleGetters} from "@shared/js/utils/generators.js";
import featureListerState from "./stateFeatureLister.js";
import layerCollection from "@core/layers/js/layerCollection.js";

const simpleGetters = {
    ...generateSimpleGetters(featureListerState),

    /**
     * Returns the feature to the given index in the list of gfiFeatures.
     * Clustering is respected.
     * @param {Object} state state of this module
     * @param {Number} featureId id of the feature in the list of gfiFeatures
     * @returns {ol.feature} the feature to the given index
     */
    selectedFeature: state => featureId => {
        const layer = layerCollection.getLayerById(state.layer.id);

        return layer.getLayerSource().getFeatureById(featureId)
    || layer.getLayerSource().getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
    },
    /**
     * Gets a list of all property keys to show in a table header.
     * @param {Object} state state of this module
     * @param {Object} getters getters of this module
     * @param {Object} rootState root state
     * @param {Object} rootGetters root getters
     * @returns {Array} [key, value] for each property
     */
    headers: (state, getters, rootState, rootGetters) => {
        let index = 0,
            headers = [];

        if (state.gfiFeaturesOfLayer.length > 0) {
            headers = Object.entries(state.gfiFeaturesOfLayer
                .reduce((acc, it) => {
                    let keys = it.getAttributesToShow();

                    keys = keys === "showAll"
                        ? Object.keys(it.getProperties()).map(prop => [prop, prop])
                        : Object.entries(keys);
                    keys.forEach(([key, value]) => {
                        if (!rootGetters.ignoredKeys.includes(key.toUpperCase())) {
                            if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "name")) {
                                acc[key] = value.name;
                            }
                            else {
                                acc[key] = value;
                            }
                        }
                    });
                    return acc;
                })).map(([key, value]) => ({name: key === "id" ? key : value, index: index++, visible: key !== "id"}));
        }
        return headers;
    },
    /**
     * Builds and returns a two-dimensional array that contains value lists per feature based on the header
     * @param {Object} state state of this module
     * @returns {Array} [[a1, b1], [a2, b2], ...] array for each line containing array for each property of the header
     */
    featureProperties: (state) => {
        let items = [];

        if (state.gfiFeaturesOfLayer.length > 0) {
            items = state.gfiFeaturesOfLayer.map((feature) => {
                const properties = feature.getProperties(),
                    attributesToShow = feature.getAttributesToShow(),
                    newProperties = {};

                Object.keys(properties).forEach((key) => {
                    if (key in attributesToShow) {

                        const newProperty = attributesToShow[key];

                        newProperties[newProperty] = properties[key];
                        newProperties.id = feature.id;
                    }
                });
                return newProperties;
            });
        }
        return items;
    },
    /**
     * Returns the geometry type of the layer.
     * @param {Object} state state of this module
     * @returns {String} the geometry type of the layer.
     */
    getGeometryType: state => {
        if (state.layer.geometryType) {
            return state.layer.geometryType;
        }
        const layer = layerCollection.getLayerById(state.layer.id),
            features = layer.getLayerSource().getFeatures();

        if (features.length > 0) {
            return features[0].getGeometry().getType();
        }
        console.warn("Fails to highlighting feature: no geometry type for layer ", state.layer.id);
        return null;
    }
};

export default simpleGetters;
