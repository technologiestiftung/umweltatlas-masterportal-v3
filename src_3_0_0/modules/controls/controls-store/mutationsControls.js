import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import changeCase from "../../../shared/js/utils/changeCase";
import stateControls from "./stateControls";

export default {
    ...generateSimpleMutations(stateControls),

    /**
     * Registers a new control element.
     * Can be called e.g. by an addon, if Store is globally accessible.
     * @param {Object} state current state
     * @param {String} name name of control in config.json
     * @returns {void}
     */
    registerControl (state, {name, control}) {
        state.addonControls[changeCase.upperFirst(name)] = control;
    }
};
