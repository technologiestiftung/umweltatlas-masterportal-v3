import actions from "./actionsWfsAnalyzer";
import getters from "./gettersWfsAnalyzer";
import mutations from "./mutationsWfsAnalyzer";
import state from "./stateWfsAnalyzer";

export default {
    namespaced: true,
    state: {...state},
    actions,
    mutations,
    getters
};
