import state from "./stateCopyrightConstraints";
import actions from "./actionsCopyrightConstraints";
import getters from "./gettersCopyrightConstraints";
import mutations from "./mutationsCopyrightConstraints";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
