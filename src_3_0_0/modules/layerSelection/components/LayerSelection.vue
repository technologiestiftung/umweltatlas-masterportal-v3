<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerFactory from "../../../core/layers/js/layerFactory";
import sortBy from "../../../shared/js/utils/sortBy";
import escapeId from "../../../shared/js/utils/escapeId";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import LayerCheckBox from "../../layerTree/components/LayerCheckBox.vue";
import SearchBar from "../../searchBar/components/SearchBar.vue";
import LayerSelectionTreeNode from "./LayerSelectionTreeNode.vue";

/**
 * Layer Selection
 * @module modules/LayerSelection
 * @vue-data {Number} selectAllConfId - The layer id for the select all checkbox.
 * @vue-data {Array} selectAllConfigs - The layer configurations for select all checkbox.
 */
export default {
    name: "LayerSelection",
    components: {
        FlatButton,
        LayerCheckBox,
        SearchBar,
        LayerSelectionTreeNode
    },
    data () {
        return {
            currentComponentSide: undefined,
            selectAllConfId: -1,
            selectAllConfigs: []
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", ["searchInput", "addLayerButtonSearchActive", "currentSide", "showAllResults"]),
        ...mapGetters("Menu", {menuCurrentComponent: "currentComponent"}),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters(["activeOrFirstCategory", "allCategories", "invisibleBaselayerConfigs", "portalConfig"]),
        ...mapGetters("Modules/LayerSelection", ["visible", "subjectDataLayerConfs", "baselayerConfs", "layersToAdd", "lastFolderNames", "layerInfoVisible", "highlightLayerId"]),
        reducedFolderNames () {
            console.log(this.lastFolderNames);
            return this.lastFolderNames.length > 0 ? this.lastFolderNames.slice(1, this.lastFolderNames.length) : [];
        },
        categorySwitcher () {
            return this.portalConfig?.tree?.categories;
        }
    },
    watch: {
        invisibleBaselayerConfigs: {
            handler (newVal) {
                this.setBaselayerConfs(newVal);
            },
            deep: true
        }
    },
    mounted () {
        this.currentComponentSide = this.menuCurrentComponent(this.currentSide).type;

        if (this.highlightLayerId) {
            const el = document.querySelector("#layer-checkbox-" + escapeId(this.highlightLayerId));

            if (el) {
                el.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
            }
        }
    },
    unmounted () {
        if (!this.layerInfoVisible) {
            this.reset();
        }
    },
    created () {
        this.provideSelectAllProps();
        this.setLayerInfoVisible(false);
    },
    methods: {
        ...mapActions(["changeCategory"]),
        ...mapActions("Modules/LayerSelection", ["updateLayerTree", "navigateBack", "navigateForward", "reset"]),
        ...mapMutations("Modules/LayerSelection", ["setLayerInfoVisible", "setBaselayerConfs"]),

        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
        /**
         * Navigates backwards in folder-menu.
         * @param {Number} steps amount of steps to go back
         * @returns {void}
         */
        navigateStepsBack (steps) {
            for (let index = 0; index < steps; index++) {
                this.navigateBack();
            }
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Listener for click on folder.
         * @param {String} lastFolderName name to show in menu to navigate back to
         * @param {Array} subjectDataLayerConfs configs to show
         * @returns {void}
         */
        folderClicked (lastFolderName, subjectDataLayerConfs) {
            this.navigateForward({lastFolderName, subjectDataLayerConfs: this.sort(subjectDataLayerConfs)});
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Returns true, if configuration shall be controlled by SelectAllCheckBox.
         * @param {Object} conf layer or folder configuration
         * @returns {Boolean} true, if configuration shall be controlled by SelectAllCheckBox
         */
        isControlledBySelectAll (conf) {
            return conf.type === "layer" && conf.showInLayerTree === false && (this.mode === "2D" ? !layerFactory.getLayerTypes3d().includes(conf.typ?.toUpperCase()) : true);
        },
        /**
         * Provides data for SelectAllCheckBox props.
         * @returns {void}
         */
        provideSelectAllProps () {
            this.subjectDataLayerConfs.forEach(conf => {
                if (this.isControlledBySelectAll(conf) && this.selectAllConfId === -1) {
                    this.selectAllConfigs = this.subjectDataLayerConfs.filter(config => this.isControlledBySelectAll(config));
                    this.selectAllConfId = conf.id;
                }
            });
        },
        /**
         * Changes category after selection.
         * @param {String} value key of the category
         * @returns {void}
         */
        categorySelected (value) {
            if (typeof value === "string") {
                const category = this.allCategories.find(aCategory => aCategory.key === value);

                this.allCategories.forEach(aCategory => {
                    aCategory.active = false;
                });
                category.active = true;
                this.changeCategory(category);
            }
        },
        /**
         * Filters the baselayer by mode.
         * @returns {void}
         */
        filterBaseLayer () {
            if (this.mode === "3D") {
                return this.baselayerConfs.filter(conf => !layerFactory.getLayerTypesNotVisibleIn3d().includes(conf.typ?.toUpperCase()));
            }
            return this.baselayerConfs;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        :id="'layer-selection'"
        class="w-100 layer-selection"
        aria-label=""
    >
        <SearchBar
            v-if="addLayerButtonSearchActive === true"
        />
        <div class="layer-selection-navigation d-flex">
            <div
                v-if="showAllResults === false"
                class="layer-selection-navigation"
            >
                <h5
                    v-if="filterBaseLayer().length > 0"
                    class="layer-selection-subheadline"
                >
                    {{ $t("common:modules.layerSelection.backgrounds") }}
                </h5>
                <div class="d-flex justify-content-start layer-selection-navigation-baselayer">
                    <template
                        v-for="(bgConf, index) in filterBaseLayer()"
                        :key="index"
                    >
                        <div class="col baselayer">
                            <LayerCheckBox
                                :conf="bgConf"
                                :is-layer-tree="false"
                            />
                        </div>
                    </template>
                </div>
                <hr
                    v-if="baselayerConfs.length > 0"
                    class="m-2"
                >
                <div
                    v-if="activeOrFirstCategory && categorySwitcher && reducedFolderNames.length === 0"
                    class="form-floating mb-3 mt-3"
                >
                    <select
                        id="select_category"
                        :value="activeOrFirstCategory.key"
                        class="form-select"
                        @change.prevent="categorySelected($event.target.value)"
                    >
                        <option
                            v-for="category in allCategories"
                            :key="category.key"
                            :value="category.key"
                        >
                            {{ $t(category.name) }}
                        </option>
                    </select>
                    <label for="select_category">
                        {{ $t("common:modules.layerTree.categories") }}
                    </label>
                </div>
                <div class="align-items-left justify-content-center layer-selection-navigation-dataLayer flex-grow-1">
                    <h5 class="layer-selection-subheadline">
                        {{ $t("common:modules.layerSelection.datalayer") }}
                    </h5>
                    <nav aria-label="breadcrumb">
                        <ol
                            v-for="(lastFolderName, index) in reducedFolderNames"
                            :key="index"
                            class="breadcrumb"
                        >
                            <li
                                :class="['breadcrumb-item', index === reducedFolderNames.length -1 ? 'active': '']"
                            >
                                <a
                                    class="mp-menu-navigation"
                                    href="#"
                                    @click="navigateStepsBack(reducedFolderNames.length-index)"
                                    @keypress="navigateStepsBack(reducedFolderNames.length-index)"
                                >
                                    <h6 class="mp-menu-navigation-link bold">{{ lastFolderName }}</h6>
                                </a>
                            </li>
                        </ol>
                    </nav>
                    <template
                        v-for="(conf, index) in subjectDataLayerConfs"
                        :key="index"
                    >
                        <LayerSelectionTreeNode
                            :conf="conf"
                            :show-select-all-check-box="selectAllConfId === conf.id"
                            :select-all-configs="selectAllConfigs"
                            @show-node="folderClicked"
                        />
                    </template>
                </div>
            </div>
            <div
                v-if="searchInput===''"
                class="d-flex justify-content-center sticky layer-selection-add-layer-btn"
            >
                <FlatButton
                    id="layer-selection-add-layer-btn"
                    aria-label="$t('common:modules.layerSelection.addSelectedSubjectsToMap', {count: layersToAdd.length})"
                    :disabled="layersToAdd.length === 0"
                    :interaction="updateLayerTree"
                    :text="layersToAdd.length === 0 ? $t('common:modules.layerSelection.selectedSubjectsCount', {count: layersToAdd.length}) : $t('common:modules.layerSelection.addSelectedSubjectsToMap', {count: layersToAdd.length})"
                    :icon="'bi-plus-circle'"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.layer-selection {
    background-color: $menu-background-color;
    left: 0px;
    top: 120px;
    position: absolute;
    padding: $padding;
    height: calc(100% - 50px);
    padding-top: 0;
    @media (max-height: 670px) {
        height: calc(100% - 85px);
    }
}
.layer-selection-navigation {
    height: 90%;
    flex-direction: column;
}

.layer-selection-navigation-baselayer {
    overflow-x: scroll;
}
@include media-breakpoint-down(md) {
    .layer-selection-navigation-baselayer {
        max-height: 120px;
    }
}
.layer-selection-navigation-dataLayer {
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: calc(100% - 100px);
    @include media-breakpoint-down(md) {
        max-height: calc(100% - 120px);
    }
}

.layer-selection-subheadline {
    margin: 15px 0 15px 0;
}
.layer-selection-add-layer-btn {
    position: sticky;
    bottom: 0px;
}
.mp-menu-navigation{
    color: $black;
    display: flex;
}
.mp-menu-navigation-link{
    display: flex;
}

@include media-breakpoint-up(sm)  {
    .layer-selection-navigation-baselayer {
        overflow-x: auto;
    }
}
.baselayer {
    min-width: 35%;
}
</style>
