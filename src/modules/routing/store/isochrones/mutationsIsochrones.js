import {generateSimpleMutations} from "@shared/js/utils/generators";
import stateIsochrones from "./stateIsochrones";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateIsochrones),

    /**
     * set values for HGV restriction parameters.
     * @param {Object} state state
     * @param {String} name name of HGV parameter
     * @param {Number} value value of HGV parameter
     */
    setIsochronesRestrictionIsValid: (state, {name, value}) => {
        state.isochronesRestrictionIsValid[name] = value;
    }
};

export default mutations;
