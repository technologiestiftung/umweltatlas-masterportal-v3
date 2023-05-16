import state from "./stateImport3D";
import actions from "./actionsImport3D";
import getters from "./gettersImport3D";
import mutations from "./mutationsImport3D";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
