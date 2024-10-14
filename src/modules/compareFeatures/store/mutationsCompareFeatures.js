import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateCompareFeatures from "./stateCompareFeatures";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateCompareFeatures),
    /**
     * Adds feature to the comparison list.
     * @param {Object} state context object.
     * @param {Object} feature feature.
     * @returns {void}
     */
    addFeatureToLayer: (state, feature) => {
        const {layerId} = feature;

        state.layerFeatures = {
            ...state.layerFeatures,
            [layerId]: [
                ...state.layerFeatures[layerId] || [],
                feature
            ]
        };
        if (Object.keys(state.layerFeatures).length > 1) {
            state.hasMultipleLayers = true;
        }
    },
    /**
     * Removes feature from displayed table comparison list.
     * @param {Object} state context object.
     * @param {Object} selectedLayer - selected layer to remove
     * @param {Object} fetureId - id of the feature
     * @returns {void}
     */
    removeFeatureFromDisplayList (state, selectedLayer, featureId) {
        for (let i = 0; i < state.preparedListDisplayTable[selectedLayer]?.items?.length; i++) {
            const item = state.preparedListDisplayTable[selectedLayer].items[i];

            if (item.id === featureId) {
                state.preparedListDisplayTable[selectedLayer].items.splice(i, 1);
                // in case it is the last element in the layer remove whole layer from the display list
                if (state.preparedListDisplayTable[selectedLayer]?.items?.length === 0) {
                    delete state.preparedListDisplayTable[selectedLayer];
                }
                break;
            }
        }
    },
    /**
     * Removes feature from comparison list, so that start gets unselected,
     * this is the case for single layer.
     * @param {Object} state context object.
     * @param {Object} fetureId - id of the feature
     * @returns {void}
     */
    removeFeatureFromListSingleLayer (state, featureId) {
        const firstLayerKey = Object.keys(state.layerFeatures)[0];

        for (const feature of state.layerFeatures[firstLayerKey]) {
            if (feature.featureId === featureId) {
                const index = state.layerFeatures[feature.layerId].indexOf(feature);

                state.layerFeatures[feature.layerId].splice(index, 1);
                state.preparedList = {
                    ...state.preparedList,
                    [firstLayerKey]: state.layerFeatures[firstLayerKey].map(f => Object.keys(f.properties).map(key => ({
                        "row-1": key,
                        [f.featureId]: f.properties[key]
                    }))
                    ).flat()
                };
                if (state.layerFeatures[firstLayerKey].length === 0) {
                    delete state.preparedList[firstLayerKey];
                    delete state.layerFeatures[firstLayerKey];
                }
            }
        }
    },
    /**
     * Removes feature from comparison list, so that star gets unselected,
     * this is the case for multiple layers.
     * @param {Object} state context object.
     * @param {Object} selectedLayer - selected layer to remove
     * @param {Object} fetureId - id of the feature
     * @returns {void}
     */
    removeFeatureFromListMultipleLayers (state, selectedLayer, featureId, features) {
        for (const feature of state.layerFeatures[selectedLayer]) {
            if (feature.featureId === featureId) {
                const index = state.layerFeatures[selectedLayer].indexOf(feature);

                state.layerFeatures[selectedLayer].splice(index, 1);
                // Necessary to trigger a rerendering of the UI, otherwise the feature gets deleted in the state but the UI won´t change.
                state.preparedList = {
                    ...state.preparedList,
                    [selectedLayer]: [...features]
                };
            }
            if (state.layerFeatures[selectedLayer].length === 0) {
                delete state.preparedList[selectedLayer];
                delete state.layerFeatures[selectedLayer];
                state.selectedLayer = Object.keys(state.layerFeatures)[0];
            }
        }
    },
    /**
     * Removes feature from comparison list by clicking its X icon and also
     * removes it from the layerFeatures array so the star icon will be deselected.
     * @param {Object} state context object.
     * @param {Object} payload - current layer and its objects
     * @returns {void}
     */
    removeFeatureFromLists (state, payload) {
        const {featureId, features, selectedLayer} = payload;

        for (const feature of features) {
            if (Object.keys(feature).includes(featureId)) {
                delete feature[featureId];
            }
        }

        mutations.removeFeatureFromDisplayList(state, selectedLayer, featureId);

        if (!state.hasMultipleLayers) {
            mutations.removeFeatureFromListSingleLayer(state, featureId);
        }
        else {
            mutations.removeFeatureFromListMultipleLayers(state, selectedLayer, featureId, features);
        }
        if (Object.keys(state.layerFeatures).length <= 1) {
            state.hasMultipleLayers = false;
        }
        if (Object.keys(state.layerFeatures).length === 0) {
            state.hasFeatures = false;
        }
    },
    /**
     * Selects the layer with its features.
     * @param {Object} state context object.
     * @param {Object} selectedLayer from user selected layer.
     * @returns {void}
     */
    selectLayerWithFeatures: (state, selectedLayer) => {
        state.layerWithFeaturesToShow = [state.layerFeatures[selectedLayer]];
        state.selectedLayer = selectedLayer;
    },
    /**
     * Sets hasMultipleLayers to false if list gets reduced to one layer
     * after removing features from comparison list.
     * @param {Object} state context object.
     * @returns {void}
     */
    resetLayerSelection: state => {
        if (Object.keys(state.layerFeatures).length <= 1) {
            state.hasMultipleLayers = false;
        }
    },
    /**
     * Sets the compare List.
     * @param {Object} state context object.
     * @param {Object} payload object with prepared list and selected layerId.
     * @returns {void}
     */
    setList: (state, payload) => {
        const layerId = payload.layerId,
            list = payload.list,
            listDisplay = payload.tableData;

        state.preparedList[layerId] = list;
        state.preparedListDisplayTable[layerId] = listDisplay;
    }
};

export default mutations;
