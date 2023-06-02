import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import import3DState from "./stateImport3D";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(import3DState),

    /**
     * Set currect projection to one in the list of projections.
     * @param {Object} state the state of coord-module
     * @param {Object[]} [projections=[]] list of available projections
     * @returns {void}
     */
    setProjections: (state, projections = []) => {
        const found = projections.filter(projection => projection.id === state.currentProjection?.id);

        if (found.length === 0) {
            // EPSG:25832 must be the first one
            const firstProj = projections.find(proj => proj.name.indexOf("25832") > -1);

            if (firstProj) {
                const index = projections.indexOf(firstProj);

                projections.splice(index, 1);
                projections.unshift(firstProj);
            }
            state.currentProjection = projections[0];
        }
        state.projections = projections;
    },
    /**
     * Pushes the coordinates to the selectedCoordinates Array in the state.
     * @param {Object} state the state of coordToolkit-module
     * @param {Object} payload payload object.
     * @returns {void}
     */
    pushCoordinates: (state, payload) => {
        state.selectedCoordinates.push(payload);
    }
};

export default mutations;
