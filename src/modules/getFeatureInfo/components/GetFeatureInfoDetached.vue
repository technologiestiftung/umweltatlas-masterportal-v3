<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import getTheme from "../js/getTheme.js";
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerCollection from "@core/layers/js/layerCollection.js";
import removeHtmlTags from "@shared/js/utils/removeHtmlTags.js";

/**
 * Get Feature Info Detached
 * @module modules/getFeatureInfo/components/GetFeatureInfoDetached
 * @vue-prop {Object} feature - The required feature.
 * @vue-prop {Boolean} isUpdated - true, if feature was updated.
 * @vue-data {Boolean} isContentHtml - Shows if content is html.
 * @vue-computed {String} title - The title of the gfi.
 * @vue-computed {String} theme - The theme in which the feature should be displayed.
 */
export default {
    name: "GetFeatureInfoDetached",
    components: {
        DefaultTheme,
        SensorTheme
    },
    props: {
        feature: {
            type: Object,
            required: true
        },
        isUpdated: {
            type: Boolean,
            required: false,
            default: false
        },
        pagerIndex: {
            type: Number,
            required: false,
            default: 0
        },
        totalFeatures: {
            type: Number,
            required: false,
            default: 1
        },
        showPageNumber: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    emits: ["updateFeatureDone"],
    data () {
        return {
            isContentHtml: false,
            lastFeature: null,
            isHeaderStuck: false,
            intersectionObserver: null
        };
    },
    computed: {
        ...mapGetters("Maps", ["clickCoordinate"]),
        ...mapGetters("Modules/SearchBar", ["searchInput"]),
        ...mapGetters("Modules/GetFeatureInfo", [
            "centerMapToClickPoint",
            "currentFeature",
            "highlightVectorRules",
            "showPolygonMarkerForWMS",
            "menuSide",
            "showMarker",
            "hideMapMarkerOnVectorHighlight",
            "stickyHeader"
        ]),

        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return removeHtmlTags(this.feature.getTitle());
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        },

        /**
         * Returns true if the page counter should be displayed.
         * @returns {Boolean} true if counter should be shown
         */
        showCounter: function () {
            return this.showPageNumber && this.totalFeatures > 1;
        },

        /**
         * Returns the formatted page counter text.
         * @returns {String} the page counter text (e.g., "(2/5)")
         */
        pageCounterText: function () {
            return `(${this.pagerIndex + 1}/${this.totalFeatures})`;
        }
    },
    created () {
        if (this.feature?.getMimeType() === "text/html") {
            this.isContentHtml = true;
        }
    },
    mounted () {
        this.highlightVectorFeature();
        this.highlightWMSFeature();
        this.setMarker();
        this.setupStickyObserver();
    },
    updated: function () {
        if (this.isUpdated) {
            this.highlightVectorFeature();
            this.highlightWMSFeature();
            this.setMarker();
            this.$emit("updateFeatureDone");
        }
    },
    beforeUnmount: function () {
        if (this.searchInput === "") {
            this.removePointMarker();
            this.removeHighlighting();
            this.removePolygonMarker();
        }
        this.disconnectStickyObserver();
    },
    methods: {
        ...mapMutations("Modules/GetFeatureInfo", ["setShowMarker"]),
        ...mapActions("Maps", [
            "placingPointMarker",
            "removePointMarker",
            "removePolygonMarker",
            "highlightFeature",
            "removeHighlightFeature",
            "setCenter"
        ]),
        removeHtmlTags,

        /**
         * Sets the center of the view on the clickCoord and place the MapMarker on it
         * Set Marker and Center.
         * @returns {void}
         */
        setMarker () {
            if (this.clickCoordinate) {
                if (this.centerMapToClickPoint) {
                    this.setCenter(this.clickCoordinate);
                }
                if (this.showMarker) {
                    this.placingPointMarker(this.clickCoordinate);
                }
            }

        },

        /**
         * Hides the map marker
         * @returns {void}
         */
        hideMarker () {
            this.setShowMarker(false);
        },

        /**
         * Highlights a vector feature if highlightVectorRules is configured in config.json.
         * @returns {void}
         */
        highlightVectorFeature () {
            if (this.highlightVectorRules) {
                const layer = layerCollection.getLayerById(this.feature.getLayerId()),
                    styleId = layer?.get("styleId"),
                    highlightObject = {
                        feature: this.feature.getOlFeature(),
                        layer: {id: this.feature.getLayerId()},
                        styleId
                    };

                if (this.hideMapMarkerOnVectorHighlight) {
                    this.hideMarker();
                    this.removePointMarker();
                }
                this.removeHighlighting();

                if (this.feature.getOlFeature() && typeof this.feature.getOlFeature().getGeometry === "function") {
                    switch (this.feature.getOlFeature().getGeometry()?.getType()) {
                        case "Point":
                        {
                            highlightObject.type = "increase";
                            highlightObject.scale = this.highlightVectorRules.image.scale;
                            break;
                        }
                        case "Polygon":
                        {
                            highlightObject.type = "highlightPolygon";
                            highlightObject.highlightStyle = {
                                fill: this.highlightVectorRules.fill,
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        case "MultiPolygon":
                        {
                            highlightObject.type = "highlightMultiPolygon";
                            highlightObject.highlightStyle = {
                                fill: this.highlightVectorRules.fill,
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        case "LineString":
                        {
                            highlightObject.type = "highlightLine";
                            highlightObject.highlightStyle = {
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        case "MultiLineString":
                        {
                            highlightObject.type = "highlightMultiLine";
                            highlightObject.highlightStyle = {
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        default:
                            break;
                    }
                }
                if (highlightObject.type) {
                    this.highlightFeature(highlightObject);
                }
                this.lastFeature = this.feature;
            }
        },
        /**
         * Highlights a feature with a Polygon-Marker
         * @returns {void}
         */
        highlightWMSFeature () {
            if (this.showPolygonMarkerForWMS) {
                const layer = layerCollection.getLayerById(this.feature.getLayerId()),
                    highlightObject = {
                        feature: this.feature.getOlFeature(),
                        layer: {id: this.feature.getLayerId()}
                    };

                if (layer?.attributes?.typ?.toLowerCase() === "wms") {
                    this.removePolygonMarker();

                    if (this.hideMapMarkerOnVectorHighlight) {
                        this.hideMarker();
                    }

                    if (this.feature.getOlFeature() && typeof this.feature.getOlFeature().getGeometry === "function") {
                        switch (this.feature.getOlFeature().getGeometry()?.getType()) {
                            case "Point": {
                                highlightObject.type = "highlightPoint";
                                break;
                            }
                            case "MultiPoint": {
                                highlightObject.type = "highlightMultiPoint";
                                break;
                            }
                            case "Polygon": {
                                highlightObject.type = "highlightPolygon";
                                break;
                            }
                            case "MultiPolygon": {
                                highlightObject.type = "highlightMultiPolygon";
                                break;
                            }
                            case "LineString": {
                                highlightObject.type = "highlightLine";
                                break;
                            }
                            case "MultiLineString": {
                                highlightObject.type = "highlightMultiLine";
                                break;
                            }
                            default:
                                break;
                        }
                    }
                    if (highlightObject.type) {
                        this.highlightFeature(highlightObject);
                    }
                    this.lastFeature = this.feature;
                }
            }
        },
        /**
         * Removes the feature highlighting
         * @returns {void}
         */
        removeHighlighting: function () {
            if (this.lastFeature) {
                this.removeHighlightFeature(this.lastFeature.getOlFeature());
            }
        },


        /**
         * In case they key exists, returns its translation. In case the key doesn't exist returns the key.
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself
         */
        translate (key, options = null) {
            return this.$t(key, options);
        },

        /**
         * Sets up the IntersectionObserver to detect when the sticky header is stuck.
         * This allows adding a visual indicator (shadow/border) when scrolling.
         * @returns {void}
         */
        setupStickyObserver () {
            if (!this.stickyHeader) {
                return;
            }

            this.$nextTick(() => {
                const sentinel = this.$refs.stickySentinel;

                if (!sentinel) {
                    return;
                }

                this.intersectionObserver = new IntersectionObserver(
                    ([entry]) => {
                        this.isHeaderStuck = !entry.isIntersecting;
                    },
                    {
                        threshold: [1],
                        rootMargin: "-1px 0px 0px 0px"
                    }
                );

                this.intersectionObserver.observe(sentinel);
            });
        },

        /**
         * Disconnects the IntersectionObserver when component is destroyed.
         * @returns {void}
         */
        disconnectStickyObserver () {
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.intersectionObserver = null;
            }
        }
    }
};
</script>

<template>
    <div>
        <div
            ref="stickySentinel"
            class="sticky-sentinel"
        />
        <div
            class="gfi-header d-flex align-items-center justify-content-between mt-3 mb-4"
            :class="{
                'gfi-header-sticky': stickyHeader,
                'is-stuck': isHeaderStuck
            }"
        >
            <slot name="pager-left" />
            <div class="gfi-title-container mx-3 flex-grow-1">
                <div
                    v-if="showCounter"
                    class="gfi-page-counter"
                >
                    {{ pageCounterText }}
                </div>
                <div class="gfi-title font-bold">
                    {{ translate(title) }}
                </div>
            </div>
            <slot name="pager-right" />
        </div>
        <component
            :is="theme"
            :feature="feature"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.sticky-sentinel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.0625rem;
    visibility: hidden;
    pointer-events: none;
}

.gfi-header {
    transition: border-color 0.2s ease-in-out;
    border-bottom: 0.0625rem solid transparent;
}

.gfi-header-sticky {
    position: sticky;
    top: 0;
    background-color: $white;
    z-index: 10;
    margin-left: -0.9375rem;
    margin-right: -0.9375rem;
    padding-left: 0.9375rem;
    padding-right: 0.9375rem;
}

.gfi-header-sticky.is-stuck {
    border-bottom-color: $light_grey;
}

.gfi-title-container {
    min-width: 0;
    text-align: center;
}

.gfi-title {
    font-size: 1.5rem;
    word-break: break-word;
    overflow-wrap: break-word;
}

.gfi-page-counter {
    font-size: 0.875rem;
    color: $dark_grey;
    font-weight: normal;
    white-space: nowrap;
    margin-bottom: 0.25rem;
}
</style>
