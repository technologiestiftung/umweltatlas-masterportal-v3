import {generateSimpleGetters} from "@shared/js/utils/generators";
import stateLayerSwiper from "./stateLayerSwiper";

const getters = {
    /**
     * Creates from every state-key a getter.
     */
    ...generateSimpleGetters(stateLayerSwiper)
};

export default getters;
