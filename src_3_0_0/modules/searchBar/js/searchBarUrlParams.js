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
                // Adresse in mehreren Suchergebnissen -> was an dieser Stelle am Besten?
                if (result.category.includes("Adresse") && result.searchInterfaceId.includes("elastic")) {
                    // noch 7 Results -> auf eins reduzieren wenn alle gleich?
                    console.log("Adresse gefunden!", result.events.onClick.zoomToResult.coordinates);
                    // erwartet Zoom Array oder Object?
                    store.dispatch("Maps/zoomToCoordinates", result.events.onClick.zoomToResult.coordinates);
                }
            });
        }
    });
}

export default {
    processSearchBarUrlParams,
    setQueryToSearchInput
};
