<script>
import {mapActions, mapMutations, mapGetters} from "vuex";
import {treeBaselayersKey, treeSubjectsKey} from "../../../shared/js/utils/constants";
import sortBy from "../../../shared/js/utils/sortBy";

/**
 * Module to display the layers in menu.
 * @module modules/layerTree/components/LayerStartModal
 */
export default {
    name: "LayerStartModal",
    components: {
    },
    data () {
        return {
            showTheModal: true
        };
    },
    computed: {
        ...mapGetters(["allLayerConfigsStructured", "showLayerAddButton", "portalConfig"]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/LayerSelection", {layerSelectionType: "type", layerSelectionName: "name"}),
        // /**
        //  * Returns the title of button.
        //  * @returns {String} the button title.
        //  */
        // title () {
        //     if (typeof this.portalConfig?.tree?.addLayerButton?.buttonTitle === "string" && this.portalConfig?.tree?.addLayerButton?.buttonTitle !== "") {
        //         return this.portalConfig?.tree?.addLayerButton?.buttonTitle;
        //     }

        //     return "common:modules.layerTree.addLayer";
        // }
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["navigateForward"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        ...mapMutations("Modules/LayerSelection", {setLayerSelectionVisible: "setVisible"}),
        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
        /**
         * Shows the component LayerSelection and sets it visible.
         * @returns {void}
         */
        showLayerSelection () {
            const subjectDataLayerConfs = this.sort(this.allLayerConfigsStructured(treeSubjectsKey)),
                baselayerConfs = this.allLayerConfigsStructured(treeBaselayersKey);
            this.changeCurrentComponent({type: this.layerSelectionType, side: this.menuSide, props: {name: this.layerSelectionName}});
            this.navigateForward({lastFolderName: "root", subjectDataLayerConfs, baselayerConfs});
            this.setLayerSelectionVisible(true);

            this.showTheModal = false

        },
        /**
         * Toggles the modal
         * @param {Boolean} value value for showTheModal
         * @returns {void}
         */
         toggleModal: function (value) {            
            this.showTheModal = false
        }
    }
};
</script>

<template lang="html">

    <div id="start-modal" v-if="showTheModal">

        <div id="start-modal-content">

            <button title="close modal" class="close-button" @click="toggleModal(false)">
                <span class="bootstrap-icon d-sm-none d-md-inline-block">
                    <i class="bi-x-lg"></i>
                </span>
            </button>

            <button @click="showLayerSelection">
                LAYERS
            </button>
            
        </div>

    </div>
    
</template>

<style lang="scss" scoped>
@import "~variables";

    #start-modal{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    #start-modal-content{
        position: relative;
        background-color: #f7f7f7;
        padding: 60px;
        width: 800px;
        max-width: 90%;
        outline: 0;
        background-color: white;
        max-height: 80%;
        overflow: auto;
            overflow-x: auto;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        overflow-x: hidden;
    }

    .close-button{
        position: absolute;
        top: 10px;
        right: 10px;
        border: none;
        background: none;
        font-size: 20px;
        cursor: pointer;
    }

</style>
