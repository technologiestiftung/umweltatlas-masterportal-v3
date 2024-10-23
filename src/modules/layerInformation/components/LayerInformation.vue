<script>
import LegendSingleLayer from "../../legend/components/LegendSingleLayer.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import {isWebLink} from "../../../shared/js/utils/urlHelper";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import LayerInfoContactButton from "../../layerTree/components/LayerInfoContactButton.vue";

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
        LayerInfoContactButton
    },
    data () {
        return {
            activeTab: "layerinfo-legend"
        };
    },
    computed: {
        ...mapGetters(["configJs"]),
        ...mapGetters("Modules/LayerInformation", [
            "abstractText",
            "customText",
            "datePublication",
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
        showAdditionalMetaData () {
            return this.layerInfo.metaURL !== null && typeof this.abstractText !== "undefined" && this.abstractText !== this.noMetadataLoaded;
        },
        showCustomMetaData () {
            return this.customText;
        },
        showPublication () {
            return typeof this.datePublication !== "undefined" && this.datePublication !== null && this.datePublication !== "";
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
        imgLink(){
            return "./resources/img/person-circle.svg"
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
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-layer-information"
    >
        <div
            v-if="abstractText"
            class="mb-2 abstract"
            v-html="abstractText"
        />

        <p v-if="showPublication">
            {{ $t("common:modules.layerInformation.publicationCreation") }}: {{ datePublication }}
        </p>

        <p v-if="showPeriodicity">
            {{ $t("common:modules.layerInformation.periodicityTitle") }}: {{ $t(periodicityKey) }}
        </p>

        <AccordionItem
            v-if="uaData.uaInfoURL"
            id="layer-info-ua"
            :title="'Umweltatlas'"
            :is-open="false"
            :font-size="'font-size-base'"
            :coloured-header="true"
            :coloured-body="true"
            :header-bold="true"
        >
            <span class="ua-break-parent">
                <span class="ua-break-one" style="width: 60px; flex: inherit; margin-right: 13px;">
                    <!-- Use float:left ? -->
                    <svg width="60" height="40" viewBox="0 0 150 89" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_336_16022)">
                        <path d="M74.0966 56.6696V59.3959C70.9985 59.4243 67.9004 59.4527 64.8022 59.4811V56.7135C67.9597 56.6825 71.2024 56.6644 74.0966 56.6696Z" fill="black"/>
                        <path d="M69.0621 69.5782C70.9262 68.7546 72.7102 68.5016 74.0966 68.4629V83.3906C74.0966 85.9569 72.0157 88.0378 69.4494 88.0378C66.8831 88.0378 64.8022 85.9569 64.8022 83.3906V72.5937C66.1964 71.2977 67.3401 70.3398 69.0621 69.5782Z" fill="black"/>
                        <path d="M84.6815 58.8021V61.5233C84.0103 61.167 83.2796 60.8365 82.487 60.5422C81.0438 60.0078 78.7048 59.3494 75.6454 59.3804C75.5602 59.3804 75.4724 59.383 75.3872 59.383V56.6851C76.4561 56.7186 77.9225 56.8271 79.6471 57.1859C81.6944 57.6093 83.401 58.2341 84.6815 58.8021Z" fill="black"/>
                        <path d="M84.6815 72.9346V83.3907C84.6815 85.9569 82.6006 88.0378 80.0344 88.0378C77.4681 88.0378 75.3872 85.9569 75.3872 83.3907V68.4888C75.6299 68.5043 75.8468 68.5249 76.0326 68.5456C79.5955 68.9457 81.9758 70.6368 83.0034 71.3855C83.8089 71.9716 84.1523 72.3407 84.6815 72.9346Z" fill="black"/>
                        <path d="M26.4785 49.8278L4.32444 83.1325H0L22.4613 49.8278L0 16.5232H4.24441L26.4785 49.8278Z" fill="#CCCCCC"/>
                        <path d="M36.1448 49.8278L14.1999 83.1325H5.56908L27.7205 49.8278L5.48389 16.5232H13.5803L36.1448 49.8278Z" fill="#CCCCCC"/>
                        <path d="M123.521 49.957L145.676 83.2616H150L127.539 49.957L150 16.6523H145.756L123.521 49.957Z" fill="#CCCCCC"/>
                        <path d="M113.855 49.957L135.8 83.2616H144.431L122.28 49.957L144.516 16.6523H136.42L113.855 49.957Z" fill="#CCCCCC"/>
                        <path d="M97.332 50.0861L119.277 83.3908H133.329L111.178 50.0861L133.415 16.7815H119.897L97.332 50.0861Z" fill="black"/>
                        <path d="M52.6676 49.957L30.7227 83.2616H16.6702L38.8216 49.957L16.585 16.6523H30.103L52.6676 49.957Z" fill="black"/>
                        <path d="M74.6126 14.9742C78.7476 14.9742 82.0997 11.6221 82.0997 7.48709C82.0997 3.35208 78.7476 0 74.6126 0C70.4776 0 67.1255 3.35208 67.1255 7.48709C67.1255 11.6221 70.4776 14.9742 74.6126 14.9742Z" fill="black"/>
                        <path d="M92.4269 21.4287V39.6301H90.4906C90.5035 38.7987 90.4647 37.6369 90.2324 36.2738C89.4011 31.3865 86.8064 28.149 85.8434 26.9795C85.1386 26.1197 81.6093 21.9709 75.2582 20.0087C70.988 18.6894 67.2909 18.9321 65.1894 19.2342C64.6059 18.3977 63.7926 17.3521 62.7031 16.2652H86.4888C87.0517 16.229 88.1386 16.2394 89.3288 16.7815C89.6799 16.9416 90.4467 17.3005 91.136 18.0724C92.2771 19.353 92.4062 20.8762 92.4269 21.4287Z" fill="black"/>
                        <path d="M116.05 80.9381C114.917 81.661 113.171 82.6137 110.886 83.2617C106.575 84.4829 102.991 83.871 101.076 83.5199C96.8546 82.7479 93.963 81.0594 93.3305 80.6799C90.8856 79.2135 89.1506 77.5018 86.8761 75.2582C85.7298 74.1249 85.136 73.4459 84.6816 72.9347C84.1524 72.3409 83.809 71.9717 83.0035 71.3856C81.9759 70.6369 79.5956 68.9459 76.0327 68.5457C75.8469 68.525 75.63 68.5044 75.3873 68.4889C75.0155 68.4631 74.5792 68.4502 74.0964 68.4631C72.71 68.5018 70.926 68.7548 69.062 69.5784C67.34 70.34 66.1963 71.2978 64.8021 72.5939C64.593 72.7849 64.3787 72.9837 64.1567 73.1928C61.9312 75.2789 61.1257 76.6059 60.0259 77.84C56.383 81.9321 51.2169 83.1145 49.4407 83.5199C42.9321 85.007 37.4794 83.1016 34.9828 82.229C34.2728 81.9811 33.6945 81.7488 33.3047 81.5835C38.1248 74.2694 42.9424 66.9527 47.7625 59.6386C53.4424 59.587 59.1222 59.5328 64.8021 59.4811C67.9002 59.4527 70.9983 59.4243 74.0964 59.3959C74.5276 59.3908 74.9562 59.3856 75.3873 59.383C75.4725 59.383 75.5603 59.3804 75.6455 59.3804C78.7049 59.3495 81.0439 60.0078 82.4871 60.5422C83.2797 60.8366 84.0104 61.167 84.6816 61.5233C86.778 62.6257 88.3116 63.9372 89.4579 64.9312C91.3529 66.5758 91.1541 66.8443 93.8469 69.3202C96.0646 71.3598 97.1722 72.3796 98.7522 73.1928C99.9889 73.8305 102.343 75.0078 105.465 74.7419C107.902 74.5354 109.701 73.5414 110.628 72.9347C112.436 75.6016 114.243 78.2712 116.05 80.9381Z" fill="#1C509A"/>
                        <path d="M92.5558 47.6333V49.8278H76.9362C77.7468 49.0662 79.5386 47.1738 80.2924 44.1479C81.258 40.2779 79.8871 37.1049 79.2597 35.8863C79.0584 35.4939 76.3475 30.4491 70.4818 29.4319C69.4103 29.246 65.6926 28.7555 62.2202 30.981C61.0067 31.7581 60.1702 32.6462 59.6384 33.3046C59.7726 32.3855 60.1986 28.7194 57.8312 25.3011C57.5833 24.9448 57.3251 24.617 57.0566 24.3123V20.8218C58.0196 21.6066 58.9671 22.6058 59.7675 23.8812C60.9654 25.7891 61.3966 27.6299 61.5747 28.7865C62.7029 28.061 64.8716 26.8966 67.7709 26.7211C73.301 26.388 77.1014 29.925 78.0979 30.8519C78.9499 31.6445 82.9181 35.339 83.0033 41.1789C83.0446 44.117 82.0868 46.4044 81.4542 47.6333H92.5558Z" fill="black"/>
                        <path d="M101.85 39.63C100.043 42.297 98.2358 44.9665 96.4285 47.6335H81.4544C82.0869 46.4046 83.0447 44.1171 83.0034 41.1791C82.9182 35.3392 78.95 31.6447 78.0981 30.8521C77.1015 29.9252 73.3012 26.3882 67.771 26.7213C64.8717 26.8968 62.7031 28.0612 61.5748 28.7867C61.3967 27.63 60.9655 25.7893 59.7676 23.8813C58.9673 22.6059 58.0198 21.6068 57.0568 20.822C54.9888 19.1386 52.8588 18.4571 52.0223 18.2015C50.8889 17.8555 47.3726 16.9312 43.5025 18.2015C41.3261 18.914 39.6738 20.112 39.1136 20.5251C38.0989 21.2712 36.8158 22.2703 36.2736 22.8486C34.7246 20.6102 33.1755 18.3744 31.6265 16.1361C33.0129 14.8658 38.7883 9.8624 47.3752 9.93985C49.9053 9.96309 54.9165 10.4485 59.7676 13.8125C60.9139 14.6077 61.8872 15.4493 62.7031 16.2652C63.7926 17.3521 64.6058 18.3977 65.1893 19.2342C67.2908 18.9321 70.9879 18.6894 75.2581 20.0087C77.9148 20.8297 80.0809 22.0354 81.7487 23.2204C84.0697 24.8676 85.4328 26.4786 85.8433 26.9794C86.8063 28.149 89.401 31.3865 90.2323 36.2738C90.4647 37.6369 90.5034 38.7987 90.4905 39.63H101.85Z" fill="#B0C8E4"/>
                        <path d="M109.467 70.9982C108.442 71.5713 106.252 72.5911 103.529 72.2891C101.484 72.0619 100.079 71.1944 98.7524 70.3527C95.5226 68.3054 95.4632 66.8519 91.5235 63.382C90.1525 62.1737 88.761 60.9629 86.6181 59.7675C86.1689 59.5197 85.5157 59.1737 84.6818 58.802C83.4012 58.234 81.6947 57.6092 79.6474 57.1858C77.9228 56.8269 76.4563 56.7185 75.3875 56.6849C74.9202 56.6694 74.5303 56.6694 74.2257 56.6694H74.0966C71.2025 56.6643 67.9598 56.6823 64.8023 56.7133C57.1706 56.7856 50.0243 56.9173 49.4408 56.9276C51.0338 54.4749 52.6241 52.0223 54.2171 49.5696C48.7102 41.5662 43.2007 33.5627 37.6938 25.5593C38.3806 24.6273 39.6921 23.0989 41.8247 21.9448C45.4649 19.9724 48.9735 20.4526 50.0863 20.6539C51.1474 20.845 54.5191 21.4543 57.057 24.3123C57.3255 24.6169 57.5837 24.9448 57.8315 25.3011C60.199 28.7194 59.773 32.3854 59.6388 33.3045C60.1706 32.6462 61.0071 31.7581 62.2205 30.981C65.693 28.7555 69.4107 29.246 70.4821 29.4319C76.3479 30.4491 79.0587 35.4939 79.2601 35.8863C79.8875 37.1049 81.2584 40.2779 80.2928 44.1479C79.5389 47.1737 77.7472 49.0662 76.9365 49.8278H95.2696C100.002 56.8837 104.734 63.9422 109.467 70.9982Z" fill="#4BA786"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_336_16022">
                        <rect width="150" height="88.0379" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </span>
                <p class="ua-break-two">
                    Ausführliche Informationen zum ausgewählten Datensatz, wie Informations- und Datengrundlagen, Methoden sowie relevante Begleitliteratur und einem Kartenimpressum finden Sie im
                    <a :href=uaData.uaInfoURL >Umweltaltas</a> 
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
                <p class="bold ua-dark-green pb-2">Datenhaltende Person</p>
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
                <p class="bold ua-dark-green pb-2">Ansprechperson zum ausgewählten Datensatz (Umweltatlas)</p>
                <div class="ua-break-parent">
                    <div>
                        <img :src=imgLink alt="" class="ua-person-img">
                    </div>
                    <div class="ua-break-two">
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
            Weiter Metadaten zu diesem Datensatz finden Sie im 
            <a v-if="uaData.uaGdiURL" :href=uaData.uaGdiURL >Metadatenportal</a>
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


        <!-- 
        Not needed?
        <LayerInfoContactButton
            :layer-name="layerName"
            previous-component="layerInformation"
        /> -->
        <!-- <div v-if="showAdditionalMetaData">
            <p
                v-for="url in metaURLs"
                :key="url"
                class="float-end"
            >
                <a
                    :href="url"
                    target="_blank"
                >
                    {{ $t("common:modules.layerInformation.additionalMetadata") }}
                </a>
            </p>
        </div>
        <br>
        <br> -->
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
                <div class="col-lg-7">
                    <ul
                        v-if="showDownloadLinks"
                        class="pt-5"
                    >
                        <li
                            v-for="downloadLink in downloadLinks"
                            :key="downloadLink.linkName"
                        >
                            <a
                                :href="downloadLink.link"
                                target="_blank"
                            >
                                {{ $t(downloadLink.linkName) }}
                            </a>
                        </li>
                    </ul>
                </div>
                <div
                    v-if="(showAttachFile)"
                    class="col-lg-5 pt-5"
                >
                    <span class="bold">{{ $t(("common:modules.layerInformation.attachFileMessage")) }}</span>
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
                    <ul>
                        <li>
                            <a
                                :href="layerUrl"
                                target="_blank"
                            >
                                {{ layerInfo.url }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    // #edf8f4

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
        width: 60px
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
