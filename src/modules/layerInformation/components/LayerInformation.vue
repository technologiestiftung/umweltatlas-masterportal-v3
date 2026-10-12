<script>
import LegendSingleLayer from "../../legend/components/LegendSingleLayer.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import {isWebLink} from "@shared/js/utils/urlHelper.js";
import AccordionItem from "@shared/modules/accordion/components/AccordionItem.vue";
import UrlInput from "../../../shared/modules/urlInput/components/UrlInput.vue";
import {buildMetaURLs} from "@shared/js/utils/metaUrlHelper.js";
import LayerInfoContactButton from "../../layerTree/components/LayerInfoContactButton.vue";
import LayerInfoFrame from "./LayerInfoFrame.vue";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";
import {getFullPathToLayer} from "../../../shared/js/utils/getFullPathToLayer";

/**
 * The parts of the Umweltatlas main content that are not shown in the iframe: the
 * "Direkt zur Kontaktinformation" anchor, its jump target and the contact block at the
 * bottom of every page. The contact is already part of the layer information next to it.
 * Everything else of the main content is kept, including the navigation links at the
 * bottom, which load the other pages of the dataset into the iframe.
 */
const infoFrameRemoveSelectors = ".anker-jumptocontact, .sprungmarke, .modul-contactinclude",

    /**
     * Heading of the section with the links to the other pages of a dataset. It is the
     * only thing telling that section apart, berlin.de gives it the same classes as
     * every other section.
     */
    infoFrameNavigationHeading = "Navigation",

    /**
     * Entries of the navigation that are not offered in the iframe: the portal shows the
     * maps itself and the downloads are already part of the layer information.
     * Matched against the label and against the last segment of the url, in lower case.
     * The label is the reliable one of the two — berlin.de points "Download" at
     * /download/ on most pages but at /abbildungen-tabellen/ on others. The url is still
     * checked as a fallback, in case a label is ever spelled differently.
     * "Kartenbeschreibung" is a different entry and stays, the match is exact.
     */
    infoFrameRemoveNavigationEntries = ["karten", "download"],

    /**
     * The heading every Umweltatlas page opens with, holding the name of the page.
     * Subsection headings are h3, so this only ever matches the page title.
     */
    infoFramePageHeading = "h2.title";

/**
 * The Layer Information that gives the user information, links and the legend for a layer
 * @module modules/layerInformation/components/LayerInformation
 * @vue-data {String} activeTab - The active tab.
 * @vue-computed {Boolean} showAdditionalMetaData - Shows if additional meta data should be displayed.
 * @vue-computed {Boolean} showCustomMetaData - Shows if custom meta data should be displayed.
 * @vue-computed {Boolean} showPublication - Shows if publication should be displayed.
 * @vue-computed {Boolean} showRevision - Determines if the revision date should be displayed.
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
        LayerInfoFrame,
        UrlInput
    },
    data () {
        return {
            activeTab: "layerinfo-legend",
            selectedOption: null,
            dropdownOptions: [],
            uaImgLink: "./resources/img/logo-umweltatlas.svg",
            berlinImgLink: "./resources/img/berlin.png",
            imgLink: "./resources/img/person-circle.svg",
            infoFrameBlocked: false,
            infoFrameReady: false,
            infoFrameNavItems: [],
            infoFrameNavUrl: null
        };
    },
    computed: {
        ...mapGetters(["configJs", "layerConfigById"]),
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
        showAbstractText () {            
            return typeof this.abstractText !== "undefined" && this.abstractText !== null && this.abstractText !== "" && this.abstractText !== "<p>undefined</p>";
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
            if (this.layerInfo.typ === "GROUP" && Array.isArray(this.layerInfo.layers)) {
                const selectedLayer = this.layerInfo.layers[this.selectedOption];

                return selectedLayer?.url && this.showUrlGlobal !== false && this.layerInfo.urlIsVisible !== false;
            }
            return this.layerInfo.url && this.layerInfo.typ !== "SensorThings" && this.showUrlGlobal !== false && this.layerInfo.urlIsVisible !== false;
        },
        selectedMetaURLs () {
            if (this.layerInfo.typ === "GROUP" && Array.isArray(this.layerInfo.layers)) {
                const selectedLayer = this.layerInfo.layers[this.selectedOption],
                    metaID = selectedLayer?.metaID;

                return buildMetaURLs(metaID, {
                    layerInfo: this.layerInfo,
                    metaDataCatalogueId: this.configJs?.metaDataCatalogueId,
                    restServiceById: this.restServiceById
                });
            }
            return this.metaURLs || [];
        },
        showAttachFile () {
            return this.downloadLinks?.length > 1;
        },
        layerUrl () {
            const layer = this.layerInfo;

            if (layer.typ === "GROUP" && layer.layers) {
                const selectedLayer = layer.layers[this.selectedOption];

                return selectedLayer ? this.getLayerAddress(selectedLayer) : "";
            }
            return layer.url ? this.getLayerAddress(layer) : "";
        },
        legendURL  () {
            return this.layerInfo.legendURL;
        },
        layerTyp () {
            if (this.layerInfo.typ !== "GROUP") {
                return `${this.layerInfo.typ}-${this.$t("common:modules.layerInformation.addressSuffix")}`;
            }

            const selectedLayer = this.layerInfo.layers[this.selectedOption];

            if (selectedLayer && selectedLayer.type) {
                return `${selectedLayer.type}-${this.$t("common:modules.layerInformation.addressSuffix")}`;
            }

            return this.$t("common:modules.layerInformation.addressSuffixes");
        },
        contact () {
            const poc = Array.isArray(this.pointOfContact) ? this.pointOfContact : (this.pointOfContact ? [this.pointOfContact] : []);
            const pub = Array.isArray(this.publisher) ? this.publisher : (this.publisher ? [this.publisher] : []);
            return poc.length ? poc : pub; // fallback to publisher if no pointOfContact
        },
        filteredContact () {
            const contacts = Array.isArray(this.contact) ? this.contact : [];

            // Wenn es 0 oder 1 Kontakt gibt: nichts filtern
            if (contacts.length <= 1) {
                return contacts;
            }

            // Bei >1 Kontakte: diese Namen ausblenden
            const blacklist = ["haag", "dollefeld", "hartbecke"];

            // Normalize (macht "Döllefeld" -> "dollefeld" für zuverlässigen Vergleich)
            const norm = (s) =>
                (s || "")
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, ""); // entfernt Umlaute/Diakritika

            return contacts.filter((c) => {
                const name = norm(c?.name);
                const individualName = norm(c?.individualName);
                const combined = `${name} ${individualName}`;

                return !blacklist.some((b) => combined.includes(b));
            });
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
            const raw = this.layerInfo?.uaDownload ?? null;
            const uaDownload =
                Array.isArray(raw) ? raw :
                typeof raw === "string" && raw.trim() ? [raw.trim()] :
                null;

            return {
                uaGdiURL: this.layerInfo?.metaID ? 'https://gdi.berlin.de/geonetwork/srv/ger/catalog.search#/metadata/' + this.layerInfo.metaID : '',
                uaInfoURL: this.layerInfo?.uaInfoURL ?? null, 
                uaDownload, 
                uaContact: this.layerInfo?.uaContact ?? null,
                uaNameLang: this.layerInfo?.uaNameLang ?? null,
                uaEbenenbeschreibung: this.layerInfo?.uaEbenenbeschreibung ?? null
            }
        },
        fullPath(){
            const allLayers = this.allLayerConfigsStructured(treeSubjectsKey)
            let fullPath = getFullPathToLayer(allLayers, this.layerInfo.id);
            fullPath === null ? "" : fullPath.pop();
            return fullPath;
        },
        /**
         * Settings for the Umweltatlas info iframe, from Config.layerInformation.uaInfoFrame.
         * @returns {Object} the configuration, empty if nothing is configured
         */
        infoFrameConfig () {
            return this.configJs?.layerInformation?.uaInfoFrame ?? {};
        },
        /**
         * The iframe is shown whenever the layer provides a uaInfoURL.
         * @returns {Boolean} true if the iframe should be rendered
         */
        showInfoFrame () {
            return this.infoFrameConfig.enabled !== false
                && Boolean(this.uaData.uaInfoURL);
        },
        /**
         * The url the iframe loads. berlin.de refuses to be framed by a foreign origin
         * ("X-Frame-Options: sameorigin"), so with a configured proxyPrefix the absolute
         * url is turned into a same origin path, which a reverse proxy forwards to
         * berlin.de. Loaded from our own origin, the frame is no longer refused.
         * Without proxyPrefix the page is loaded straight from berlin.de.
         * @returns {String} the iframe src
         */
        infoFrameSrc () {
            const prefix = this.infoFrameConfig.proxyPrefix,
                url = this.uaData.uaInfoURL;

            return prefix && url?.startsWith(prefix) ? url.slice(prefix.length) : url;
        },
        /**
         * The page currently loaded in the iframe: the one the user picked from the
         * navigation, otherwise the dataset's summary page.
         * @returns {String} the iframe src
         */
        infoFrameCurrentSrc () {
            return this.infoFrameNavUrl ?? this.infoFrameSrc;
        },
        /**
         * The navigation shown above the iframe. The summary page is put in front of the
         * entries taken from the page, because its own navigation does not link to it and
         * there would otherwise be no way back to it.
         * @returns {Object[]} items with label and href
         */
        infoFrameNavigationItems () {
            if (this.infoFrameNavItems.length === 0) {
                return [];
            }
            return [
                {label: this.$t("common:modules.layerInformation.uaInfoFrameSummary"), href: this.infoFrameSrc},
                ...this.infoFrameNavItems
            ];
        }
    },

    watch: {
        /**
         * Watches changes to `selectedOption` and updates the layer's abstract information accordingly.
         *
         * @param {Number} newIndex - The newly selected layer index.
         */
        selectedOption (newIndex) {
            const metaInfo = this.getMetaInfoForLayer(newIndex);

            this.getAbstractInfo(metaInfo);
        },

        /**
         * A different layer means a different page, so the previous blocked state is void
         * and the new page has to be hidden again until it has been trimmed.
         * @returns {void}
         */
        "uaData.uaInfoURL" () {
            this.infoFrameBlocked = false;
            this.infoFrameReady = false;
            this.infoFrameNavItems = [];
            this.infoFrameNavUrl = null;
        }
    },

    created () {
        this.setConfigParams(this.configJs);

        if (this.layerInfo.typ === "GROUP") {
            this.createDropdownOptions();
        }
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
        ...mapActions("Modules/LayerInformation", ["setConfigParams", "additionalSingleLayerInfo", "getAbstractInfo"]),
        ...mapActions("Modules/Legend", ["createLegendForLayerInfo"]),
        ...mapMutations("Modules/LayerInformation", ["setMetaDataCatalogueId", "setSelectedLayerIndex"]),
        ...mapMutations("Modules/Legend", ["setLayerInfoLegend"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        ...mapActions("Modules/SearchBar", [
            "showInTree"
        ]),
        isWebLink,

        /**
         * Creates the dropdown options from the layers and selects the first option.
         * This method maps the `layerInfo.layers` array to create an array of dropdown options,
         * where each option has a `value` (the index of the layer) and a `label` (the name of the layer).
         * If any options are available, the first option is selected by default.
         *
         * @returns {void}
         */
        createDropdownOptions () {
            this.dropdownOptions = this.layerInfo.layers.map((layer, index) => ({
                value: index,
                label: this.$t(layer.name)
            }));

            if (this.dropdownOptions.length > 0) {
                this.selectedOption = this.dropdownOptions[0].value;
            }
        },

        /**
         * Handles the change of the selected layer from the dropdown.
         * Updates the layer information displayed based on the selected layer.
         *
         * @param {Event} event - The change event from the dropdown.
         * @returns {void}
         */
        handleDropdownChange (event) {
            const selectedLayerIndex = event.target.value;

            if (selectedLayerIndex !== -1) {
                this.setSelectedLayerIndex(selectedLayerIndex);
            }
            else {
                console.warn(`Layer not found: ${event.target.label}`);
            }
        },

        /**
         * Retrieves metadata information for a specified layer.
         *
         * @param {number} index - Index of the layer to fetch metadata for.
         * @returns {Object} Metadata for the layer, including:
         *   - {String} metaId - The metadata ID for the layer.
         *   - {String} cswUrl - The CSW URL for the layer.
         *   - {Object} customMetadata - Additional custom metadata for the layer.
         *   - {Object} attributes - Attributes related to the layer.
         */
        getMetaInfoForLayer (index) {
            return {
                metaId: this.layerInfo.layers[index].metaID,
                cswUrl: this.layerInfo.cswUrl,
                customMetadata: this.layerInfo.customMetadata,
                attributes: this.layerInfo.attributes
            };
        },

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
         * Removes slash or questionmark from the end of the url.
         * @param {String} url the url to clean
         * @returns {String} the cleaned URL
         */
        cleanUrl (url) {
            let baseUrl = url.split("?")[0];

            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.slice(0, -1);
            }
            return baseUrl;
        },
        /**
         * Generates a GetCapabilities URL from a given service base address and type vor 2D layers or
         * Appends 'tileset.json' to TileSet3D layers url, if not exists.
         * Appends always 'layer.json' to Terrain3D layers url.
         * @param {Object} param payload
         * @param {String} param.url service base URL
         * @param {String} param.typ service type (e.g., WMS)
         * @returns {String} the created URL
         */
        getLayerAddress (layerInfo) {
            const typ = layerInfo.typ ?? layerInfo.type,
                config = this.layerConfigById(layerInfo.id);
            let url = config?.origUrl ? config.origUrl : layerInfo.url,
                urlObject = new URL(url, location.href);

            if (typ && typ.toUpperCase() === "TILESET3D") {
                const baseUrl = this.cleanUrl(url);

                // if no json-file is provided in masterportalAPI src/layer/tileset.js "/tileset.json" is appended
                url = baseUrl + (baseUrl.endsWith(".json") ? "" : "/tileset.json");
                urlObject = new URL(url, location.href);
            }
            else if (typ && typ.toUpperCase() === "TERRAIN3D") {
                // terrain layer: in Cesium "/layer.json" is appended to url
                urlObject = new URL(this.cleanUrl(url) + "/layer.json", location.href);
            }
            else if (typ && typ !== "OAF") {
                urlObject.searchParams.set("SERVICE", typ);
                urlObject.searchParams.set("REQUEST", "GetCapabilities");
            }
            return urlObject.href;
        },
        openInLayerTree (id) {
            this.showInTree({layerId: id});
        },
        filenameFromUrl(url) {
            try {
            const clean = url.split("#")[0].split("?")[0];
            const name = clean.substring(clean.lastIndexOf("/") + 1) || url;
            return decodeURIComponent(name);
            } catch {
            return url;
            }
        },

        /**
         * Best effort detection of a refused framing (X-Frame-Options / frame-ancestors).
         * A refused document leaves the frame on about:blank, which stays readable from
         * here, while a page that really loaded throws a SecurityError on the same access.
         * When the page came through the proxy it is same origin and can be trimmed down
         * to the part of the Umweltatlas page we actually want to show.
         * @param {Event} event the iframe load event
         * @returns {void}
         */
        onInfoFrameLoad (event) {
            let frameWindow = null,
                doc = null;

            try {
                frameWindow = event.target.contentWindow;
                this.infoFrameBlocked = frameWindow.location.href === "about:blank";
                doc = event.target.contentDocument;
            }
            catch (error) {
                // loaded cross origin: the frame works, but its document stays untouchable
                this.infoFrameBlocked = false;
                this.infoFrameReady = true;
                return;
            }
            if (!this.infoFrameBlocked && doc) {
                this.trimInfoFrameDocument(doc);
                // the navigation links at the bottom load another page of the dataset
                // into the iframe, which has to be hidden and trimmed again
                frameWindow.addEventListener("pagehide", this.onInfoFrameUnload);
            }
            // only now is the page reduced to what we want to show, so reveal it
            this.infoFrameReady = true;
        },

        /**
         * Hides the iframe again as soon as it starts loading another page, so the
         * untrimmed berlin.de page is never visible.
         * @returns {void}
         */
        onInfoFrameUnload () {
            this.infoFrameReady = false;
        },

        /**
         * Loads another page of the dataset into the iframe.
         * @param {String} href the page to load
         * @returns {void}
         */
        openInfoFramePage (href) {
            if (href === this.infoFrameCurrentSrc) {
                return;
            }
            this.infoFrameReady = false;
            this.infoFrameNavUrl = href;
        },

        /**
         * Reduces the Umweltatlas page to its main content, minus the contact anchor and
         * the contact block, see infoFrameRemoveSelectors. Everything else is kept, as the
         * number and kind of sections differ per page: "zusammenfassung" has the summary
         * and a note on how current the data is, "download" a list of downloads, and so on.
         * Only possible while the page is served through the proxy, because a cross
         * origin document cannot be modified.
         * @param {Document} doc the document inside the iframe
         * @returns {void}
         */
        trimInfoFrameDocument (doc) {
            const main = doc.getElementById("layout-grid__area--maincontent");

            if (!main || !doc.body || doc.body.dataset.uaTrimmed === "true") {
                return;
            }
            const style = doc.createElement("style");

            main.querySelectorAll(infoFrameRemoveSelectors).forEach(element => element.remove());
            this.trimInfoFrameLinks(main);
            // The page opens with its own title ("Zusammenfassung", "Methode", …), which
            // the navigation above the iframe already shows. Only this first one goes,
            // the h3 below it are the headings of the actual content.
            // Has to run after the navigation section, that one starts with a title too.
            main.querySelector(infoFramePageHeading)?.remove();
            doc.body.replaceChildren(main);
            doc.body.dataset.uaTrimmed = "true";

            style.textContent = this.infoFrameCss();
            doc.head?.appendChild(style);
        },

        /**
         * Takes the navigation out of the page and keeps it as data for the tab bar the
         * component renders above the iframe. Only the "zusammenfassung" page carries a
         * navigation, so without this the user would be stranded on the first subpage
         * they open. Every link left in the page leads away from the dataset and is
         * opened in a new tab, so the iframe never shows an untrimmed page.
         * @param {HTMLElement} main the main content of the Umweltatlas page
         * @returns {void}
         */
        trimInfoFrameLinks (main) {
            const navigation = this.infoFrameNavigation(main);

            if (navigation) {
                this.infoFrameNavItems = Array.from(navigation.querySelectorAll("a[href]"))
                    .map(link => ({
                        label: link.textContent.trim(),
                        href: (link.getAttribute("href") || "").split(/[?#]/)[0]
                    }))
                    .filter(item => item.href && !this.isRemovedNavigationItem(item));
                navigation.remove();
            }

            main.querySelectorAll("a[href]").forEach(link => {
                // in page anchors have nothing to open in a tab
                if ((link.getAttribute("href") || "").startsWith("#")) {
                    return;
                }
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener");
            });
        },

        /**
         * Whether a navigation entry is one of the pages the iframe does not offer,
         * see infoFrameRemoveNavigationEntries.
         * @param {Object} item the navigation entry
         * @param {String} item.label the link text
         * @param {String} item.href the link target
         * @returns {Boolean} true if the entry is dropped
         */
        isRemovedNavigationItem ({label, href}) {
            const slug = href.replace(/\/+$/, "").split("/").pop().toLowerCase();

            return infoFrameRemoveNavigationEntries.includes(label.trim().toLowerCase())
                || infoFrameRemoveNavigationEntries.includes(slug);
        },

        /**
         * Finds the section holding the links to the other pages of the dataset.
         * Only the "zusammenfassung" page has one.
         * @param {HTMLElement} main the main content of the Umweltatlas page
         * @returns {HTMLElement|null} the navigation section
         */
        infoFrameNavigation (main) {
            return Array.from(main.querySelectorAll("section")).find(section => {
                const heading = section.querySelector("h1, h2, h3, h4, h5, h6");

                return heading?.textContent.trim() === infoFrameNavigationHeading;
            }) ?? null;
        },

        /**
         * Css injected into the iframe, so the Umweltatlas text reads like the layer
         * information next to it. The values are taken from the sidebar itself rather
         * than from the scss variables, because the iframe has its own root font size
         * and "rem" would not mean the same thing in there.
         * @returns {String} the css
         */
        infoFrameCss () {
            const sidebar = window.getComputedStyle(this.$el),
                font = sidebar.fontFamily,
                size = sidebar.fontSize,
                color = sidebar.color,
                main = "#layout-grid__area--maincontent";

            return `
                ${this.portalFontFaceCss()}
                /* berlin.de forces a scrollbar with "html {overflow-y: scroll}", which
                   leaves a dead bar next to the short pages shown here */
                html {
                    overflow-y: auto;
                }
                /* the portal's scrollbar, see src/assets/css/masterportal.css */
                ::-webkit-scrollbar-track {
                    border-radius: 10px;
                    background-color: white;
                }
                ::-webkit-scrollbar {
                    width: 12px;
                    background-color: white;
                }
                ::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
                    background-color: lightgray;
                    border: 3px solid white;
                }
                body {
                    margin: 0;
                    padding: 12px;
                    background: #fff;
                    color: ${color};
                }
                ${main}, ${main} * {
                    font-family: ${font} !important;
                    font-size: ${size} !important;
                    line-height: 1.5 !important;
                    margin-top: 0px !important;
                }
                ${main} h1, ${main} h2, ${main} h3,
                ${main} h4, ${main} h5, ${main} h6 {
                    font-size: ${size} !important;
                    font-weight: bold !important;
                    margin: 0 0 0.5rem 0;
                }
                ${main} img {
                    max-width: 100%;
                    height: auto;
                }`;
        },

        /**
         * The @font-face rules of the portal, with the font urls made absolute. Relative
         * urls would be resolved against berlin.de inside the iframe and not be found,
         * and without them the iframe would fall back to Arial instead of MasterPortalFont.
         * @returns {String} the css
         */
        portalFontFaceCss () {
            const rules = [];

            Array.from(document.styleSheets).forEach(sheet => {
                let cssRules = null;

                try {
                    cssRules = sheet.cssRules;
                }
                catch (error) {
                    return; // stylesheet of another origin, not readable
                }
                Array.from(cssRules || []).forEach(rule => {
                    if (rule.type === 5) { // CSSRule.FONT_FACE_RULE
                        rules.push(rule.cssText.replace(
                            /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
                            (match, quote, url) => `url("${new URL(url, sheet.href || location.href).href}")`
                        ));
                    }
                });
            });
            return rules.join("\n");
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-layer-information"
    >
        <div class="ua-layer-info-main">
            <div v-if="fullPath" class="mb-4">
                <span
                    v-for="(key, value) in fullPath"
                    :key="key"
                    class="mb-0"
                >
                    <a 
                        @click="openInLayerTree(fullPath[value].id)"
                        href="#" 
                        class="ua-breadcrumbs"
                    >
                        {{ fullPath[value].name }}
                    </a>
                    <span> / </span>
                </span>
            </div>

            <div
                v-if="showAbstractText"
                class="mb-2 abstract"
                v-html="abstractText"
            />

            <p v-if="showPublication || showRevision">
                <span v-if="showPublication">
                    {{ $t("common:modules.layerInformation.publicationCreation") }}: {{ datePublication }}
                </span>
                <span v-if="showRevision">
                    <br>
                    {{ $t("common:modules.layerInformation.periodicityTitle") }}: {{ dateRevision }}
                </span>
            </p>

            <AccordionItem
                v-if="showInfoFrame"
                id="layer-info-ua-frame"
                :title="$t('common:modules.layerInformation.uaInfoFrameAccordion')"
                :is-open="true"
                :font-size="'font-size-base'"
                :coloured-header="true"
                :coloured-body="true"
                :header-bold="true"
            >
                <LayerInfoFrame
                    :src="infoFrameCurrentSrc"
                    :external-url="uaData.uaInfoURL"
                    :title="$t('common:modules.layerInformation.uaInfoFrameTitle') + layerName"
                    :blocked="infoFrameBlocked"
                    :ready="infoFrameReady"
                    :navigation-items="infoFrameNavigationItems"
                    @load="onInfoFrameLoad"
                    @navigate="openInfoFramePage"
                />
            </AccordionItem>

            <AccordionItem
                v-if="uaData.uaEbenenbeschreibung"
                id="layer-info-ua-ebenenbeschreibung"
                :title="'Über diese Kartenebene'"
                :is-open="false"
                :font-size="'font-size-base'"
                :coloured-header="true"
                :coloured-body="true"
                :header-bold="true"
            >
                <p class="mb-0" style="white-space: pre-wrap;">
                    {{ uaData.uaEbenenbeschreibung }}
                </p>
            </AccordionItem>

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
                        <a :href=uaData.uaInfoURL target="_blank">
                            <img style="width: 60px; height: 40px;" :src=uaImgLink alt=""/>
                        </a>
                    </span>
                    <p class="ua-break-two">
                        Die ausführlichen Informationen zum ausgewählten Datensatz, wie Grundlagen, Methode, Kartenbeschreibung sowie relevante Begleitliteratur finden sie zusätzlich auch im
                        <a :href=uaData.uaInfoURL target="_blank">Umweltaltas</a> 
                    </p>
                </span>
                <span class="ua-break-parent">
                    <span class="ua-break-one" style="width: 60px; flex: inherit; margin-right: 13px;">
                        <a v-if="uaData.uaGdiURL" :href=uaData.uaGdiURL target="_blank">
                            <img style="width: 60px;" :src=berlinImgLink alt=""/>
                        </a>
                    </span>
                    <p class="ua-break-two" v-if="uaData.uaGdiURL">
                        Weitere Metadaten zu diesem Datensatz, wie z.B. Nutzungsbedingungen, finden Sie in der 
                        <a v-if="uaData.uaGdiURL" :href=uaData.uaGdiURL target="_blank">Geodatensuche</a>
                    </p>
                </span>
            </AccordionItem>

            <AccordionItem
                v-if="contact.length || uaData.uaContact"
                id="layer-info-contact"
                :title="$t('Kontakt')"
                :is-open="false"
                :font-size="'font-size-base'"
                :coloured-header="true"
                :coloured-body="true"
                :header-bold="true"
            >
                <span v-if="filteredContact.length" class="contact-wrapper">
                    <p class="font-bold ua-dark-green pb-2">Fachlich verantwortlich</p>
                    <div
                    v-for="(c, idx) in filteredContact"
                    :key="c.email || c.name || idx"
                    class="ua-break-parent"
                    style="padding-bottom: 10px;"
                    >
                        <div>
                            <img :src="imgLink" alt="" class="ua-person-img">
                        </div>
                        <div class="ua-break-two" style="flex: 1 1 0%;">
                            <p v-if="c?.name">{{ c.name }}</p>
                            <p
                            v-for="pos in (c?.positionName || [])"
                            :key="pos"
                            v-if="(c?.positionName || []).length"
                            >
                                {{ pos }}
                            </p>
                            <p v-if="c?.individualName">{{ c.individualName }}</p>
                            <p v-if="c?.phone">{{ c.phone }}</p>
                            <!-- street + postalCode + city (your current output is a bit odd; this is a cleaner version) -->
                            <p v-if="c?.street || c?.postalCode">
                            {{ [c.street, c.postalCode].filter(Boolean).join(" ") }}
                            </p>
                            <p v-if="c?.city">{{ c.city }}</p>
                            <a v-if="c?.email" :href="'mailto:' + c.email">{{ c.email }}</a>
                        </div>
                    </div>
                </span>

                <span v-if="uaData.uaContact" class="ua-contact-wrapper">
                    <p class="font-bold ua-dark-green pb-2">Umweltatlas</p>
                    <div class="ua-break-parent">
                        <div>
                            <img :src=imgLink alt="" class="ua-person-img">
                        </div>
                        <div class="ua-break-two">
                            <p>Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin</p>
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

            <div v-if="uaData.uaDownload?.length" class="mb-4 d-grid gap-2">
                <p v-if="uaData.uaDownload.length > 1" class="mb-2 mt-8" style="margin-top: 20px;">Karten als PDF herunterladen</p>
                <a v-for="(url, idx) in uaData.uaDownload" :key="url || idx" :href="url">
                    <button
                    class="btn btn-light w-100 ua-button"
                    type="button"
                    aria-label="download"
                    :style="uaData.uaDownload.length === 1 ? { marginTop: '16px' } : {}"
                    >
                    <i
                        class="bi-download position-absolute"
                        aria-hidden="true"
                        style="left: .75rem; top: 50%; transform: translateY(-50%); line-height: 1;"
                    />
                    {{ uaData.uaDownload.length > 1 ? filenameFromUrl(url) : "Karte als PDF herunterladen" }}
                    </button>
                </a>
            </div>

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
                        :selected-layer="selectedOption"
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
    </div>
</template>

<style lang="scss">
    @import "~variables";

    /* The iframe sits in an accordion in the normal flow of the layer information, so it
       cannot take the full height and gets a fixed one. */
    .ua-layer-info-frame {
        height: 60vh;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        // border: 1px solid $light_grey;
        border-radius: 5px;
        overflow: hidden;
        background-color: $white;
        padding-top: 10px;
    }

    .ua-layer-info-frame-fallback {
        padding: 10px;
    }

    /* The navigation of the Umweltatlas page, lifted out of the iframe so it survives
       when the user opens one of the subpages, which carry no navigation themselves. */
    .ua-layer-info-frame-nav {
        flex: 0 0 auto;
        display: flex;
        flex-wrap: wrap;
        gap: 2px 1rem;
        padding: 6px 10px;
        border-bottom: 1px solid $light_grey;
    }

    .ua-layer-info-frame-nav-item {
        padding: 0;
        border: 0;
        background: none;
        color: $link-color;
        text-decoration: underline;

        &:hover {
            opacity: 0.7;
        }

        &.active {
            color: $dark_green;
            font-weight: bold;
            text-decoration: none;
            cursor: default;
        }
    }

    /* Holds the iframe and the overlay that covers it while loading, so that the
       navigation above stays visible and clickable. */
    .ua-layer-info-frame-body {
        position: relative;
        flex: 1 1 auto;
        display: flex;
        min-height: 0;
    }

    /* Covers the iframe while the Umweltatlas page is still the full berlin.de page.
       It is only reduced to the part we want once it has finished loading, and without
       this the whole page would be visible for a moment. */
    .ua-layer-info-frame-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $white;
        z-index: 1;
    }

    .ua-layer-info-iframe {
        flex: 1 1 auto;
        width: 100%;
        border: 0;

        &-loading {
            visibility: hidden;
        }
    }

    .ua-breadcrumbs{
        color: #000; 
        opacity: 0.7;

        &:hover{
            opacity: 1; 
        }
    }

    .ua-button{
        border: 1px solid #ddd;
        border-radius: 5px;
        width: fit-content !important;
        margin-top: 2px;
        position:relative;
        padding-left: 2.25rem;
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
