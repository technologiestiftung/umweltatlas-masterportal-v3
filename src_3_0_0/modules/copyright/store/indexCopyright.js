import state from "./stateCopyright";
import actions from "./actionsCopyright";
import getters from "./gettersCopyright";
import mutations from "./mutationsCopyright";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
