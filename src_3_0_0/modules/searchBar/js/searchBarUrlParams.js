import store from "../../../app-store";
import processUrlParams from "../../../shared/js/utils/processUrlParams";

const searchBarUrlParams = {
        QUERY: setQueryToSearchInput
    },
    legacySearchBarUrlParams = {
        "SEARCH/QUERY": setQueryToSearchInput
    };

/**
 * Process the searchBar url params.
 * @returns {void}
 */
function processSearchBarUrlParams () {
    processUrlParams(searchBarUrlParams, legacySearchBarUrlParams);
}

/**
 * Sets the query to searchInput in the searchBar.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setQueryToSearchInput (params) {
    const value = params.QUERY ? params.QUERY : params["SEARCH/QUERY"];

    store.commit("Modules/SearchBar/setSearchInput", value);
    store.dispatch("Modules/SearchBar/startSearch", value);

    store.watch((state, getters) => getters["Modules/SearchBar/searchResults"], results => {
        if (results) {
            results.forEach(result => {
                if (result.category.includes("Adresse") && result.searchInterfaceId.includes("elastic")) {
                    const numberCoordinates = result.events.onClick.zoomToResult.coordinates?.map(coordinate => parseFloat(coordinate, 10));

                    store.dispatch("Maps/zoomToCoordinates", {center: numberCoordinates});
                    store.dispatch("Maps/placingPointMarker", numberCoordinates);
                }
            });
        }
    });
}

export default {
    processSearchBarUrlParams,
    setQueryToSearchInput
};
