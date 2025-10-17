import {generateSimpleGetters} from "@shared/js/utils/generators.js";
import stateLayerTree from "./stateLayerTree.js";

/**
 * The getters for the LayerTree.
 * @module modules/layerTree/store/gettersLayerTree
 */
const getters = {
    ...generateSimpleGetters(stateLayerTree)
};

export default getters;
