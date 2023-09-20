/**
 * Contains global actions of the search bar.
 * @module modules/searchBar/store/actions/actionsSearchBar
 */
import actionsSearchBarResultList from "./actionsSearchBarResultList";
import actionsSearchBarSearchInterfaces from "./actionsSearchBarSearchInterfaces";
import actionsSearchBarSearchResult from "./actionsSearchBarSearchResult";
import SearchInterface from "../../searchInterfaces/searchInterface";

export default {
    ...actionsSearchBarResultList,
    ...actionsSearchBarSearchInterfaces,
    ...actionsSearchBarSearchResult,

    /**
     * Overwrite default values in search interface.
     * @param {Object} param.state the state
     * @returns {void}
     */
    overwriteDefaultValues: ({state}) => {
        SearchInterface.prototype.timeout = state.timeout;
    },
    /**
     * Handles the switch from the single result view to the search overview and updates the menu navigation values.
     * @param {Object} param.getters the getters
     * @param {Object} param.commit the commit
     * @param {Object} side the menu side of the search
     * @returns {void}
     */
    updateSearchNavigation: ({getters, commit}, side) => {
        const type = rootGetters["Menu/currentComponent"](side).type;
        console.log(getters.showAllResults)
        if (getters.showAllResults === true && side === getters.currentSide) {
            commit("setShowAllResults", false);

        if (getters.showAllResults === true && side === getters.currentSide) {
            if (type !== "searchbar") {
                commit("Menu/switchToPreviousComponent", side, {root: true});
            }
            else {
                commit("setShowAllResults", false);
                commit("Menu/setCurrentComponentPropsName", {side: side, name: "common:modules.searchBar.searchResultList"}, {root: true});
                commit("Menu/setNavigationHistoryBySide", {side: side, newHistory: [{type: "root", props: []}]}, {root: true});
            }
        }
        if (side !== getters.currentSide) {
            commit("Menu/switchToPreviousComponent", side, {root: true});
        }
    },
    /**
     * Handles the switch from the single result view to the search overview and updates the menu navigation values.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @param {Object} side the menu side of the search
     * @returns {void}
     */
    startLayerSelectionSearch: ({dispatch, commit}, side) => {
        commit("setShowAllResults", true);
        dispatch("Menu/clickedMenuElement", {
            name: "common:modules.searchBar.searchResultList",
            side: side,
            type: "searchbar"
        }, {root: true});
        commit("Menu/setCurrentComponent", {type: "layerSelection", side: side, props: []}, {root: true});
        commit("Menu/setCurrentComponentPropsName", {side: side, name: "common:modules.searchBar.searchResults"}, {root: true});
        commit("Menu/setNavigationHistoryBySide", {side: side, newHistory: [{type: "root", props: []}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}, {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}}]}, {root: true});
    },
    /**
     * Checks for addlayer search configuration (instance and topic)
     * @param {Object} param.getters the getters
     * @param {Object} param.rootState the rootState
     * @param {Object} side the menu side of the search
     * @returns {void}
     */
    checkLayerSelectionSearchConfig: ({state, getters, dispatch, commit, rootState}, side) => {
        const searchBar = rootState.portalConfig?.tree?.addLayerButton?.searchBar;

        if (rootState.portalConfig?.tree?.addLayerButton?.active === true && searchBar.active !== undefined) {
            if (searchBar.searchInterfaceInstance || searchBar.searchCategory) {
                if (searchBar.searchCategory && searchBar.searchInterfaceInstanceId) {
                    commit("setShowAllResultsSearchInterfaceInstance", searchBar.searchInterfaceInstanceId);
                    commit("setShowAllResultsSearchCategory", searchBar.searchCategory);
                }
                else {
                    console.warn("Please check the searchBar configuration at tree.addLayerButton");
                }
            }

            if (searchBar.active === true || searchBar.active === false) {
                commit("setAddLayerButtonSearchActive", searchBar.active);
            }
        }
    }
// todo checkfunction, searchbar with portal, tests

   /*  "addLayerButton": {
        "active": true,
        "searchBar": {
          "active": true,
          "searchInterfaceInstance": "elasticSearch_0",
          "searchCategory": "Thema (externe Fachdaten)"
        } */
};
