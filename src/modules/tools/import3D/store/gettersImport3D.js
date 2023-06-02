
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import import3DState from "./stateImport3D";

const getters = {
    ...generateSimpleGetters(import3DState),

    // NOTE overwrite getters here if you need a special behaviour in a getter

    /**
     * Returns the projection to the given id.
     * @param {Object} state state of this tool
     * @param {String} id of the projection, is like the name and in case of decimal "-DG" is appended to name
     * @returns {Object} projection
     */
    getProjectionById: state => (id) => {
        const projections = state.projections;

        return projections.find(projection => {
            return projection.id === id;
        });
    }
};

export default getters;
