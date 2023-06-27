
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import import3DState from "./stateModeler3D";

const getters = {
    ...generateSimpleGetters(import3DState),

    // NOTE overwrite getters here if you need a special behaviour in a getter
    scene () {
        return mapCollection.getMap("3D").getCesiumScene();
    },
    entities () {
        return mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;
    },
    getModelNameById: state => (id) => {
        const allModels = state.importedModels.concat(state.drawnModels),
            model = allModels.find(x => x.id === id);

        return model.name;
    },
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
    },
    /**
     * Returns the label name depending on the selected coordinate system.
     * @param {Object} state state of this tool
     * @param {String} key in the language files
     * @returns {String} the name of the label
     */
    getLabel: (state) => (key) => {
        const type = state.currentProjection?.projName !== "longlat" ? "cartesian" : "hdms";

        return "modules.tools.modeler3D.entity.projections." + type + "." + key;
    }
};

export default getters;
