<script>
import LegendSingleLayer from "../../legend/components/LegendSingleLayer.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import {isWebLink} from "../../../shared/js/utils/urlHelper";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import UrlInput from "../../../shared/modules/urlInput/components/UrlInput.vue";
import LayerInfoContactButton from "../../layerTree/components/LayerInfoContactButton.vue";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";
import {getFullPathToLayer} from "../../../shared/js/utils/getFullPathToLayer";

/**
 * The Layer Information that gives the user information, links and the legend for a layer
 * @module modules/layerInformation/components/LayerInformation
 * @vue-data {String} activeTab - The active tab.
 * @vue-computed {Boolean} showAdditionalMetaData - Shows if additional meta data should be displayed.
 * @vue-computed {Boolean} showCustomMetaData - Shows if custom meta data should be displayed.
 * @vue-computed {Boolean} showPublication - Shows if publication should be displayed.
 * @vue-computed {Boolean} showPeriodicity - Shows if periodicity should be displayed.
 * @vue-computed {Boolean} showDownloadLinks - Shows if download lonks should be displayed.
 * @vue-computed {Boolean} showUrl - Shows if url should be displayed.
 * @vue-computed {Boolean} showAttachFile - Shows if file type needs to be attached for download.
 * @vue-computed {String} layerUrl - The layer URL.
 * @vue-computed {String} legendURL - The legend URL.
 * @vue-computed {String} contact - Contact information from pointOfContact if given otherwise from publisher from meta data information.
 * @vue-computed {Boolean} menuIndicator - Returns the menu the LayerInfo module is in.
 * @vue-computed {String} layerName - Name of the layer.
 */
export default {
    name: "LayerInformation",
    components: {
        LegendSingleLayer,
        AccordionItem,
        LayerInfoContactButton,
        UrlInput
    },
    data () {
        return {
            activeTab: "layerinfo-legend",
            uaImgLink: "./resources/img/logo-umweltatlas.svg",
            imgLink: "./resources/img/person-circle.svg"
        };
    },
    computed: {
        ...mapGetters(["configJs"]),
        ...mapGetters("Modules/LayerInformation", [
            "abstractText",
            "customText",
            "datePublication",
            "dateRevision",
            "downloadLinks",
            "layerInfo",
            "legendAvailable",
            "metaURLs",
            "noMetadataLoaded",
            "periodicityKey",
            "showUrlGlobal",
            "pointOfContact",
            "publisher"
        ]),
        ...mapGetters("Modules/Legend", [
            "layerInfoLegend"
        ]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),
        ...mapGetters(["allLayerConfigsStructured"]),
        showAdditionalMetaData () {
            return this.layerInfo.metaURL !== null && typeof this.abstractText !== "undefined" && this.abstractText !== this.noMetadataLoaded;
        },
        showCustomMetaData () {
            return this.customText;
        },
        showPublication () {
            return typeof this.datePublication !== "undefined" && this.datePublication !== null && this.datePublication !== "";
        },
        showRevision () {
            return typeof this.dateRevision !== "undefined" && this.dateRevision !== null && this.dateRevision !== "";
        },
        showPeriodicity () {
            return this.periodicityKey !== "" && this.periodicityKey !== null && this.periodicityKey !== undefined;
        },
        showDownloadLinks () {
            return this.downloadLinks !== null;
        },
        showUrl () {
            return (this.layerInfo.url && this.layerInfo.typ !== "SensorThings" && this.showUrlGlobal === true) || (this.layerInfo.url && this.layerInfo.typ !== "SensorThings" && this.showUrlGlobal === undefined && this.layerInfo.urlIsVisible !== false);
        },
        showAttachFile () {
            return this.downloadLinks && this.downloadLinks.length > 1;
        },
        layerUrl () {
            return Array.isArray(this.layerInfo.url) ? this.layerInfo.url.map((url, i) => ({url, typ: this.layerInfo.typ?.[i]})).map(this.getGetCapabilitiesUrl) : this.getGetCapabilitiesUrl({url: this.layerInfo.url, typ: this.layerInfo.typ});
        },
        legendURL  () {
            return this.layerInfo.legendURL;
        },
        layerTyp  () {
            return this.layerInfo.typ !== "GROUP" ? `${this.layerInfo.typ}-${this.$t("common:modules.layerInformation.addressSuffix")}` : this.$t("common:modules.layerInformation.addressSuffixes");
        },
        contact () {
            return this.pointOfContact || this.publisher || null;
        },
        menuIndicator () {
            return this.mainMenu.currentComponent === "layerInformation"
                ? "mainMenu"
                : "secondaryMenu";
        },
        layerName () {
            
            return this.menuIndicator === "mainMenu"
                ? this.mainMenu.navigation.currentComponent.props.name
                : this.secondaryMenu.navigation.currentComponent.props.name;
        },
        uaData(){      
            return {
                uaGdiURL: this.layerInfo?.metaID ? 'https://gdi.berlin.de/geonetwork/srv/ger/catalog.search#/metadata/' + this.layerInfo.metaID : '',
                uaInfoURL: this.layerInfo?.uaInfoURL ?? null, 
                uaDownload: this.layerInfo?.uaDownload ?? null, 
                uaContact: this.layerInfo?.uaContact ?? null,
                uaNameLang: this.layerInfo?.uaNameLang ?? null
            }
        },
        fullPath(){
            const allLayers = this.allLayerConfigsStructured(treeSubjectsKey) 
            let fullPath = getFullPathToLayer(allLayers, this.layerInfo.id);
            fullPath.pop();
            return fullPath;
        }
    },

    created () {
        this.setConfigParams(this.configJs);
    },

    mounted () {
        if (this.configJs?.metaDataCatalogueId) {
            this.setMetaDataCatalogueId(this.configJs.metaDataCatalogueId);
        }
        this.createLegendForLayerInfo(this.layerInfo.id);
        if (!this.legendAvailable) {
            this.activeTab = "LayerInfoDataDownload";
        }
    },

    unmounted () {
        this.setLayerInfoLegend({});
    },

    methods: {
        ...mapActions("Modules/LayerInformation", ["setConfigParams"]),
        ...mapActions("Modules/Legend", ["createLegendForLayerInfo"]),
        ...mapMutations("Modules/LayerInformation", ["setMetaDataCatalogueId"]),
        ...mapMutations("Modules/Legend", ["setLayerInfoLegend"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        ...mapActions("Modules/SearchBar", [
            "showInTree"
        ]),
        isWebLink,

        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab ? true : null;
        },
        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {void}
         */
        setActiveTab (evt) {
            if (evt && evt.target && evt.target.hash) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },
        /**
         * returns the classnames for the tab
         * @param {String} tab name of the tab depending on property activeTab
         * @returns {String} classNames of the tab
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), show: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },
        /**
         * generates a GetCapabilities URL from a given service base address and type
         * @param {Object} param payload
         * @param {String} param.url service base URL
         * @param {String} param.typ service type (e.g., WMS)
         * @returns {String} GetCapabilities URL
         */
        getGetCapabilitiesUrl ({url, typ}) {
            const urlObject = new URL(url, location.href);

            if (typ !== "OAF") {
                urlObject.searchParams.set("SERVICE", typ);
                urlObject.searchParams.set("REQUEST", "GetCapabilities");
            }
            return urlObject.href;
        },
        openInLayerTree (id) {
            this.showInTree({layerId: id});
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-layer-information"
    >
        <div v-if="fullPath" class="mb-4">
            <span
                v-for="(key, value) in fullPath"
                :key="key"
                class="mb-0"
            >
                <a 
                    @click="openInLayerTree(fullPath[value].id)"
                    href="#" 
                    class="ua-breadcrumbs font-bold"
                >
                    {{ fullPath[value].name }}
                </a>
                <span> / </span>
            </span>
        </div>

        <div
            v-if="abstractText"
            class="mb-2 abstract"
            v-html="abstractText"
        />

        <p v-if="showPublication">
            {{ $t("common:modules.layerInformation.publicationCreation") }}: {{ datePublication }}
            <span v-if="showRevision">
                {{ " / " + $t(dateRevision) }}
            </span>
        </p>

        <p v-if="showPeriodicity">
            {{ $t("common:modules.layerInformation.periodicityTitle") }}: {{ $t(periodicityKey) }}
        </p>





        <AccordionItem
            v-if="uaData.uaInfoURL"
            id="layer-info-ua"
            :title="'Über diesen Datensatz'"
            :is-open="false"
            :font-size="'font-size-base'"
            :coloured-header="true"
            :coloured-body="true"
            :header-bold="true"
        >
            <span class="ua-break-parent">
                <span class="ua-break-one" style="width: 60px; flex: inherit; margin-right: 13px;">
                    <img style="width: 60px; height: 40px;" :src=uaImgLink alt=""/>
                </span>
                <p class="ua-break-two">
                    Ausführliche Informationen zum ausgewählten Datensatz, wie Informations- und Datengrundlagen, Methoden sowie relevante Begleitliteratur und einem Kartenimpressum finden Sie im
                    <a :href=uaData.uaInfoURL target="_blank">Umweltaltas</a> 
                </p>
            </span>
        </AccordionItem>

        <AccordionItem
            v-if="contact || uaData.uaContact"
            id="layer-info-contact"
            :title="$t('Kontakt')"
            :is-open="false"
            :font-size="'font-size-base'"
            :coloured-header="true"
            :coloured-body="true"
            :header-bold="true"
        >
            <span v-if="contact" class="contact-wrapper">
                <p class="font-bold ua-dark-green pb-2">Ansprechperson datenhaltende Stelle</p>
                <div class="ua-break-parent">
                    <!-- <i class="bi-person-circle ua-break-one" style="padding-right: 12px;"></i> -->
                    <div>
                        <img :src=imgLink alt="" class="ua-person-img">
                    </div>
                    <div class="ua-break-two" style="flex: 1 1 0%;">
                        <p v-if="contact.name">
                            {{ contact.name }}
                        </p>
                        <p
                            v-if="contact.positionName"
                            v-for="(positionName) in contact.positionName"
                            :key="positionName"
                        >
                            {{ positionName }}
                        </p>
                        <p v-if="contact.street && contact.postalCode">
                            {{ contact.street + "  " + contact.postalCode }}
                        </p>
                        <p v-if="contact.name">
                            {{ contact.city }}
                        </p>
                        <a
                            v-if="contact.email"
                            :href="'mailto:' + contact.email"
                        >
                            {{ contact.email }}
                        </a>
                        <p class="pb-4"></p>
                    </div>
                </div>
            </span>

            <span v-if="uaData.uaContact" class="ua-contact-wrapper">
                <p class="font-bold ua-dark-green pb-2">Ansprechperson Umweltatlas</p>
                <div class="ua-break-parent">
                    <div>
                        <img :src=imgLink alt="" class="ua-person-img">
                    </div>
                    <div class="ua-break-two">
                        <p>Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen</p>
                        <p v-if="uaData.uaContact.name">
                            {{ uaData.uaContact.name }}
                        </p>
                        <p v-if="uaData.uaContact.tel">
                            {{ uaData.uaContact.tel }}
                        </p>
                        <a
                            v-if="uaData.uaContact.email"
                            :href="'mailto:' + uaData.uaContact.email"
                        >
                            {{ uaData.uaContact.email }}
                        </a>
                    </div>
                </div>
       
                <p class="pb-2"></p>
            </span>

        </AccordionItem>

        <p class="mt-4 p-0" v-if="uaData.uaGdiURL">
            Weiter Metadaten zu diesem Datensatz, wie z.B. Nutzungsbedigungen, finden Sie im 
            <a v-if="uaData.uaGdiURL" :href=uaData.uaGdiURL target="_blank">Metadatenportal</a>
        </p>

        <p class="mb-4" v-if="uaData.uaDownload">
            <a v-if="uaData.uaDownload" :href=uaData.uaDownload class="">
                <button
                    class="btn btn-light w-100 ua-button"
                    type="button"
                    :aria-label="'text'"
                >
                    <i class="bi-download" style="padding-right: 2px;"/>
                    Karte als PDF herunterladen
                </button>
            </a>
        </p>

        <template
            v-if="showCustomMetaData"
        >
            <div
                v-for="(key, value) in customText"
                :key="key"
            >
                <p
                    v-if="isWebLink(key)"
                    class="mb-0"
                >
                    {{ value + ": " }}
                    <a
                        :href="value"
                        target="_blank"
                    >{{ key }}</a>
                </p>
                <p
                    v-else
                    class="mb-0"
                >
                    {{ value + ": " + key }}
                </p>
            </div>
        </template>

        <hr>

        <nav role="navigation">
            <ul class="nav nav-tabs">
                <li
                    v-if="legendAvailable"
                    value="layerinfo-legend"
                    class="nav-item"
                >
                    <a
                        href="#layerinfo-legend"
                        class="nav-link"
                        :class="{active: isActiveTab('layerinfo-legend') }"
                        @click="setActiveTab"
                    >{{ $t("common:modules.layerInformation.legend") }}
                    </a>
                </li>
                <li
                    v-if="showDownloadLinks"
                    value="LayerInfoDataDownload"
                    class="nav-item"
                >
                    <a
                        href="#LayerInfoDataDownload"
                        class="nav-link"
                        :class="{active: isActiveTab('LayerInfoDataDownload') }"
                        @click="setActiveTab"
                    >{{ $t("common:modules.layerInformation.downloadDataset") }}
                    </a>
                </li>
                <li
                    v-if="showUrl"
                    value="url"
                    class="nav-item"
                >
                    <a
                        href="#url"
                        class="nav-link"
                        :class="{active: isActiveTab('url') }"
                        @click="setActiveTab"
                    >{{ layerTyp }}
                    </a>
                </li>
            </ul>
        </nav>

        <div class="tab-content">
            <div
                v-if="legendAvailable"
                id="layerinfo-legend"
                :class="getTabPaneClasses('layerinfo-legend')"
                :show="isActiveTab('layerinfo-legend')"
            >
                <LegendSingleLayer
                    v-if="legendURL !== 'ignore'"
                    :legend-obj="layerInfoLegend"
                />
            </div>
            <div
                id="LayerInfoDataDownload"
                class="row"
                :class="getTabPaneClasses('LayerInfoDataDownload')"
                :show="isActiveTab('LayerInfoDataDownload')"
                :type="String('LayerInfoDataDownload')"
            >
                <div class="">
                    <ul
                        v-if="showDownloadLinks"
                        class="pt-5 pl-2"
                        style="padding-bottom: 0px;"
                    >
                        <li
                             v-for="downloadLink in downloadLinks"
                            :key="downloadLink.linkName"
                            class="mb-4"
                        >
                            <p class="pb-0 pt-0 mt-0 mb-2">{{ downloadLink.linkName }}</p>
                            <UrlInput :layerUrl="downloadLink.link"/>
                        </li>
                    </ul>
                </div>
            </div>
            <div
                v-if="showUrl"
                id="url"
                :show="isActiveTab('url')"
                :class="getTabPaneClasses('url')"
                :type="String('url')"
            >
                <div
                    v-if="Array.isArray(layerInfo.url)"
                    class="pt-5"
                >
                    <ul
                        v-for="(layerInfoUrl, i) in layerInfo.url"
                        :key="layerInfoUrl"
                    >
                        {{ layerInfo.layerNames[i] }}
                        <li>
                            <a
                                :href="layerUrl"
                                target="_blank"
                            >
                                {{ layerInfoUrl }}
                            </a>
                        </li>
                    </ul>
                </div>
                <div
                    v-else
                    class="pt-5"
                >
                    <UrlInput :layerUrl="layerUrl"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    .ua-breadcrumbs{
        color: #000; 
        opacity: 0.7;

        &:hover{
            opacity: 1; 
        }
    }

    .ua-button{
        border: 1px solid #ddd;
        margin: 10px 0px;
        border-radius: 5px;
        width: fit-content !important;
        margin-top: 16px;
        // float: right;
    }

    .ua-contact-wrapper p {
        margin-bottom: 0px;
    }

    .ua-dark-green{
       color: $dark_green
    }

    .contact-wrapper p {
        margin-bottom: 0px;
    }

    .ua-break-parent {
      display: flex;
      flex-wrap: wrap; /* Allows wrapping of children if space is not enough */
    }

    .ua-break-one {
        width: 60px;
        box-sizing: border-box;
        margin-right: 10px;
    }

    /* Second child, which takes up the remaining space */
    .ua-break-two {
        flex: 1;
        box-sizing: border-box;
        min-width: 200px;
    }

    .bi-person-circle{
        font-size: 60px;
        color: $dark_green
    }

    .ua-person-img{
        padding-right: 12px;
        padding-bottom: 4px;
        width: 60px;
    }

    hr {
        margin: 15px 0 10px 0;
    }

    .abstract {
        max-height: 40vH;
        overflow-y: auto;
    }

    .abstract > p {
        font-size: $font-size-base;
    }

    .layerInformation {
        position: absolute;
        overflow: unset;
        top: 20px;
        right: 60px;
        max-width:600px;
        width: 45vw;
        margin: 0 10px 30px 10px;
        z-index: 1010;
        background-color: $white;
        box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.176);
        border: 1px solid $light_grey;

        @include media-breakpoint-down(sm) {
            inset: 12px auto auto 0;
            max-width:750px;
            width: 95vw;
            max-height: 80vh;
        }
    }

    .header {
        padding: 10px 10px 5px 10px;
        border-bottom: 1px solid $light_grey;
        cursor: move;
    }
    .bi-x-lg {
        &:hover {
            opacity: 0.7;
            cursor: pointer;
        }
    }

    .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
        >li {
            font-size: $font-size-base;
            >a {
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }
    .tab-content {
        .tab-pane {
            >ul {
                >li {
                    >a {
                        font-size: $font-size-base;
                        text-overflow: ellipsis;
                        display: inline-block;
                        max-width: 95%;
                        overflow: hidden;
                    }
                }
            }
        }
        #layerinfo-legend {
            max-width: 95%;
            overflow: auto;
        }
    }

    .mb-2 {
        margin-bottom: 2rem;
    }

    .dropdown-toggle {
        width: 100%;
    }

    .dropdown-menu {
        width: 100%;
        a.active {
            background-color: $accent_active;
            color: white;
        }
        a:hover {
            background-color: $accent_hover;
        }
    }

    .pt-5 {
        padding-top: 5px;
    }

</style>
