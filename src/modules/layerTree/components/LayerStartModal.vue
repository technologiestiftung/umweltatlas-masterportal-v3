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
            uaImgLink: "./resources/img/logo-umweltatlas.svg",
            showTheModal: true,
            subjects:[
                {
                    title:"Boden",
                    value:"Boden",
                    "imgSrc":"./resources/img/welcome-img/fotolia_40771294_subscription_monthly_xxl.jpg",
                    "copySrc":"© Samiylenko - Forolia.com"
                },
                {
                    title:"Wasser",
                    value:"Wasser",
                    "imgSrc":"./resources/img/welcome-img/depositphotos_147902709_xl-2015.jpg",
                    "copySrc":"© chrissi/ Depositphotos.com"
                },
                {
                    title:"Luft",
                    value:"Luft",
                    "imgSrc":"./resources/img/welcome-img/depositphotos_324010502_xl-2015.jpg",
                    "copySrc":"© yskandag / depositphotos.com"
                },
                {
                    title:"Klima",
                    value:"Klima",
                    "imgSrc":"./resources/img/welcome-img/fotolia_26968330_subscription_monthly_l.jpg",
                    "copySrc":"© alm1982 - Fotolia.com"
                },                {
                    title:"Biotope",
                    value:"Biotope",
                    "imgSrc":"./resources/img/welcome-img/fotolia_42033806_subscription_monthly_xxl.jpg",
                    "copySrc":"© photocreo - Fotolia.com"
                },                {
                    title:"Nutzung",
                    value:"Nutzung",
                    "imgSrc":"./resources/img/welcome-img/depositphotos_182915374_xl-2015_fransz.jpg",
                    "copySrc":"© depositphotos - fransz"
                },                {
                    title:"Verkehr / Lärm",
                    value:"Verkehr / Lärm",
                    "imgSrc":"./resources/img/welcome-img/fotolia_46452680_subscription_monthly_xl.jpg",
                    "copySrc":"© berlinphotos030 - Fotolia.com"
                },                {
                    title:"Energie",
                    value:"Energie",
                    "imgSrc":"./resources/img/welcome-img/fotolia_35979355_subscription_monthly_xl.jpg",
                    "copySrc":"© Thorsten Schier - Fotolia.com"
                },                {
                    title:"Mensch",
                    value:"Mensch",
                    "imgSrc":"./resources/img/welcome-img/depositphotos_15819245_xl-2015.jpg",
                    "copySrc":"© berlinphotos030 - Fotolia.com"
                }
            ]
        };
    },
    computed: {
        ...mapGetters(["allLayerConfigsStructured", "showLayerAddButton", "portalConfig"]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/LayerSelection", {layerSelectionType: "type", layerSelectionName: "name"}),
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
         * Listener for click on subject.
         * @folderName {String} the name of the folder
         * @idx {number} the index
         * @returns {void}
         */
        obSubjectSelect(folderName,idx){
            const subjectDataLayerConfs = this.sort(this.allLayerConfigsStructured(treeSubjectsKey));
            const subjectDataLayerConfsSubfolder = this.sort(this.allLayerConfigsStructured(treeSubjectsKey))[idx].elements;
            this.changeCurrentComponent({type: this.layerSelectionType, side: this.menuSide, props: {name: this.layerSelectionName}});
            this.navigateForward({lastFolderName: "root", subjectDataLayerConfs});   
            this.navigateForward({lastFolderName: folderName, subjectDataLayerConfs: this.sort(subjectDataLayerConfsSubfolder)});
            this.setLayerSelectionVisible(true);
            this.showTheModal = false
        },
        /**
         * Toggles the modal
         * @param {Boolean} value value for showTheModal
         * @returns {void}
         */
         toggleModal: function (value) {            
            this.showTheModal = value
        }
    }
};
</script>

<template lang="html">

    <div id="start-modal" v-if="showTheModal" @click="toggleModal(false)">

        <div id="start-modal-content">

            <button title="close modal" class="close-button btn btn-light" @click="toggleModal(false)">
                <span class="bootstrap-icon d-md-inline-block">
                    <i class="bi-x-lg"></i>
                </span>
            </button>
            <div class="row">
                <h2 class="mb-1">
                    <img :src=uaImgLink alt=""/>
                   <span><span class="bold">Umweltatlas Berlin&thinsp;</span>
                   <span></span></span>
                </h2>
                <p class="info-text mb-3">
                Die Katenanwendung des Umweltatlas Berlin ist das Portal für raumbezogenen Umweltdaten der Hauptstadt und die kartenzentrierte Erweiterung
                des
                <a href="https://www.berlin.de/umweltatlas/" target="_blank"
                    >Umweltatlas Berlin</a
                >.  Entdecke Informationen und Karten zu diesen Themenbereichen:
            </p>
                <template
                    v-for="(conf, idx) in subjects"
                    :key="idx"
                >
                    <div class="col-md-4">
                        <button @click="obSubjectSelect(conf.value,idx)">
                            <span class="img-wrapper">
                                <span class="img-text">
                                    <span
                                        class="bootstrap-icon d-md-inline-block"
                                        ><i class="bi-arrow-right-short"></i
                                    ></span>
                                    {{conf.title}}
                                </span>
                                <img
                                    loading="lazy"
                                    :src=conf.imgSrc
                                />
                            </span>
                        </button>
                        <p class="img-copyright">Bild: {{conf.copySrc}}</p>
                    </div>
                </template>
            </div>
                
            
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
        background-color: rgba(0, 0, 0, 0.7);
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

    @media (max-width: 450px) {
        #start-modal-content {
            padding: 20px;
            max-height: 95%;
        }

        h2{
            font-size:20px
        }
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

    h2 {
        align-items: center;
        display: flex;
        padding-bottom: 15px;

        img {
            width: 100px;
            padding-right: 12px;
        }
    }

    .row {

        .col-md-4 {
            margin-bottom: 10px;
        }

        .img-wrapper {
            position: relative;
            height: fit-content;
            display: inherit;

            .img-text {
                position: absolute;
                background-color: $secondary;
                color: white;
                font-size: 17px;
                padding: 3px 10px;

                span {
                    font-size: 25px;
                }
            }

            img {
                width: 100%;
                // max-height: 150px;
            }
        }

        .img-copyright {
            text-align: left;
            font-size: 12px;
            color: #999;
        }

        p.info {
            font-size: 15px;
            color: #333333;
        }

        button {
            // This removes styles added by default to button elements.
            // For when something should semantically be a button,
            // but isn't buttony in appearance.
            background-color: transparent;
            border: none;
            margin: 0;
            padding: 0;
            text-align: inherit;
            font: inherit;
            border-radius: 0;
            appearance: none; // Just in case we missed anything.
        }

        button:hover {
            border-color: $dark_green;
            .img-text {
                background-color: $dark_green;
                background-color: #000;

            }
        }
    }
</style>
