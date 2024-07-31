<script>
import {mapGetters} from "vuex";
import SearchBarResultListTopicTreeItem from "./SearchBarResultListTopicTreeItem.vue";

/**
 * Searchbar result list to show search results for topic tree.
 * @module modules/searchBar/components/SearchBarResultListTopicTree
 * @vue-props {Object[]} resultItems - The result items.
 * @vue-data {Array} items - All result items.
 * @vue-data {Boolean} watchFirstTime - is set to true, if watched first time at prop resultItems
 */
export default {
    name: "SearchBarResultListTopicTree",
    components: {
        SearchBarResultListTopicTreeItem
    },
    props: {
        resultItems: {
            type: Array,
            required: true
        }
    },
    data: () => {
        return {
            items: [],
            watchFirstTime: true
        };
    },
    computed: {
        ...mapGetters(["portalConfig"]),
        ...mapGetters("Modules/SearchBar", [
            "searchInput",
            "searchResults",
            "selectedSearchResults"
        ])
    },
    watch: { 
        resultItems: {
            /**
             * New search results are integrated in old results by name.
             * @param {Array} newSearchResult new search result
             * @param {Array} oldSearchResult old search result
             * @returns {void}
             */
            handler (newSearchResult, oldSearchResult) {
                if(this.watchFirstTime){
                    //unset items, to reset doublicated entries from assignement in mounted function
                    this.items= [];
                    this.watchFirstTime = false;
                }
                if(!(newSearchResult.length === oldSearchResult.length && oldSearchResult.every(osr => newSearchResult.find((nsr) => nsr.id === osr.id))) || this.items.length === 0){
                        if(newSearchResult.length > this.items.length){
                            newSearchResult.forEach(result => {
                            const index = this.items.findIndex( item => item.name === result.name);
                            if(index > -1){
                                this.items.splice(index, 0, result);
                            }
                            else{
                                this.items.push(result);
                            }
                        });
                    }
                    else{
                        this.items.forEach(item => {
                            const index = newSearchResult.findIndex( result => result.name === item.name);
                            if(index > -1){
                                newSearchResult.splice(index, 0, item);
                            }
                            else{
                                newSearchResult.push(item);
                                }
                        });
                        this.items = newSearchResult;
                    }
                }
            },
            deep: true
        },
      },
      mounted(){
            this.items = this.resultItems;
      }
};
</script>

<template lang="html">
    <div class="results-topic-tree-container">
        <div
            v-for="(item, index) in items"
            :key="item.id + '-' + index"
        >
            <span :id="'searchInputLi' + index">
                <SearchBarResultListTopicTreeItem
                    :search-result="item"
                />
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.results-topic-tree-container {
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
