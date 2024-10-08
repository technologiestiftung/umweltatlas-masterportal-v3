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
     * Removes feature from comparison list by clicking its X icon and also
     * removes it from the layerFeatures array so the star icon will be deselected.
     * @param {Object} state context object.
     * @param {Object} payload - current layer and its objects
     * @returns {void}
     */
    removeFeatureFromLists: function (state, payload) {
        const {featureId} = payload,
            {features} = payload,
            {selectedLayer} = payload;

        for (const feature of features) {
            if (Object.keys(feature).includes(featureId)) {
                delete feature[featureId];
            }
        }
        // remove from the display list
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
        if (!state.hasMultipleLayers) {
            const firstLayerKey = Object.keys(state.layerFeatures)[0];

            for (const feature of state.layerFeatures[firstLayerKey]) {
                if (feature.featureId === featureId) {
                    const index = features.indexOf(feature);

                    state.layerFeatures[firstLayerKey].splice(index, 1);
                    // state.preparedList = {
                    //     ...state.preparedList,
                    //     [firstLayerKey]: state.layerFeatures[firstLayerKey].map(f => (
                    //         Object.keys(f.properties).map(key => ({
                    //             "row-1": key,
                    //             [f.featureId]: f.properties[key]
                    //         }))
                    //     )).flat()
                    // };
                    if (state.layerFeatures[firstLayerKey].length === 0) {
                        delete state.preparedList[firstLayerKey];
                        delete state.layerFeatures[firstLayerKey];
                    }
                }
            }
        }
        else {
            for (const feature of state.layerFeatures[selectedLayer]) {
                if (feature.featureId === featureId) {
                    const index = state.layerFeatures[selectedLayer].indexOf(feature);

                    state.layerFeatures[selectedLayer].splice(index, 1);
                    // Necessary to trigger a rerendering of the UI, otherwise the feature gets deleted in the state but the UI won´t change.
                    // state.preparedList = {
                    //     ...state.preparedList,
                    //     [selectedLayer]: [...features]
                    // };
                }
                if (state.layerFeatures[selectedLayer].length === 0) {
                    delete state.preparedList[selectedLayer];
                    delete state.layerFeatures[selectedLayer];
                    state.selectedLayer = Object.keys(state.layerFeatures)[0];
                }
            }
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
        const layerId = payload.a,
            list = payload.b,
            listDisplay = payload.c;

        state.preparedList[layerId] = list;
        state.preparedListDisplayTable[layerId] = listDisplay;
    }
};

export default mutations;
