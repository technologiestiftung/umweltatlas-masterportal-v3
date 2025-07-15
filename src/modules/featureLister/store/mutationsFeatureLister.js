import {generateSimpleMutations} from "@shared/js/utils/generators";
import stateFeatureLister from "./stateFeatureLister";
import getGfiFeatureModule from "@shared/js/utils/getGfiFeaturesByTileFeature";
import layerCollection from "@core/layers/js/layerCollection";
import tabStatus from "../tabStatus";
import GeoJSON from "ol/format/GeoJSON";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateFeatureLister),
    /**
     * Sets the compare List.
     * @param {Object} state context object.
     * @returns {void}
     */
    setGfiFeaturesOfLayer: (state, payload) => {
        const layerFromCollection = layerCollection.getLayerById(state.layer.id),
            features = payload ?? layerFromCollection.getLayerSource().getFeatures(),
            geojsonFormat = new GeoJSON();

        if (features) {
            const gfiFeatures = [],
                olLayer = layerFromCollection.getLayer();

            features.forEach(feature => {
                if (feature.values_ && Object.prototype.hasOwnProperty.call(feature.values_, "features")) {
                    feature.values_.features.forEach(nestedFeature => {
                        const gfiFeature = getGfiFeatureModule.getGfiFeature(olLayer.values_, nestedFeature.values_),
                            geojsonString = geojsonFormat.writeFeature(nestedFeature),
                            geojsonObj = JSON.parse(geojsonString);

                        gfiFeature.id = nestedFeature.getId();
                        gfiFeature.geojsonGeom = geojsonObj.geometry;
                        gfiFeatures.push(gfiFeature);
                    });
                    state.nestedFeatures = true;
                }
                else {
                    const gfiFeature = getGfiFeatureModule.getGfiFeature(olLayer.values_, feature.values_),
                        geojsonString = geojsonFormat.writeFeature(feature),
                        geojsonObj = JSON.parse(geojsonString);

                    gfiFeature.id = feature.getId();
                    gfiFeature.geojsonGeom = geojsonObj.geometry;
                    gfiFeatures.push(gfiFeature);
                    state.nestedFeatures = false;
                }
            });
            state.gfiFeaturesOfLayer = gfiFeatures;
        }
    },
    /**
     * Resets the featureLister to the themeChooser tab by setting the
     * selected layer and feature to null, making their respective tabs
     * disabled.
     * @param {Object} state context object.
     * @returns {void}
     */
    resetToThemeChooser: (state) => {
        state.selectedRow = null;
        state.layer = null;
        state.layerListView = tabStatus.ACTIVE;
        state.featureListView = tabStatus.DISABLED;
        state.featureDetailView = tabStatus.DISABLED;
        state.selectedArea = null;
    }
};

export default mutations;
