<script>
import {mapGetters} from "vuex";
import Overlay from "ol/Overlay.js";
import Select from "ol/interaction/Select.js";
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import {pointerMove} from "ol/events/condition.js";
import {Popover} from "bootstrap";
import {toRaw} from "vue";

/**
 * IsochronesHoverData
 * @module modules/routing/components/Isochrones/IsochronesHoverData
 * @vue-data {Object} map - map on which the popover should be displayed on
 * @vue-data {Object} overlay - openlayers overlay
 * @vue-data {Object} hoverMenu - hover menu of displayed data as bootstrap popover
 * @vue-data {Array<Number>} coordinates - position of hover menu
 * @vue-data {Object} selectAreaInteraction - openlayers select interaction
 * @vue-data {Object} selectedArea - current selected isochrone feature
 */
export default {
    name: "IsochronesHoverData",
    data () {
        return {
            overlay: null,
            hoverMenu: null,
            coordinates: null,
            selectAreaInteraction: null,
            selectedArea: null
        };
    },
    computed: {
        ...mapGetters("Modules/Routing", ["isochronesSettings"]),
        ...mapGetters("Modules/Routing/Isochrones", ["isochronesAreaLayer"])
    },
    mounted () {
        this.overlay = new Overlay({
            id: "routing-hover-menu",
            element: this.$refs.routingHoverMenu
        });

        this.getMap().addOverlay(this.overlay);

        this.selectAreaInteraction = new Select({
            layers: [this.isochronesAreaLayer],
            style: this.getSelectedStyle,
            condition: pointerMove
        });

        this.selectAreaInteraction.on("select", event => {
            if (event.selected.length > 0) {
                this.selectedArea = event.selected[0];
            }
            else {
                this.selectedArea = null;
            }
        });

        this.getMap().addInteraction(this.selectAreaInteraction);

        this.getMap().getViewport().addEventListener("mousemove", this.setHoverMenu);

    },
    unmounted () {
        this.getMap().removeOverlay(this.getMap().getOverlayById("routing-hover-menu"));
        this.getMap().getViewport().removeEventListener("mousemove", this.setHoverMenu);
        this.getMap().removeInteraction(this.selectAreaInteraction);
    },
    methods: {
        /**
         * Sets new hover menu after hovering on isochrone area
         * @param {Event} event event
         * @returns {void}
         */
        setHoverMenu (event) {
            event.preventDefault();

            this.coordinates = this.getMap().getEventCoordinate(event);
            this.overlay.setPosition(this.coordinates);

            this.hoverMenu = Popover.getInstance(this.overlay.getElement());

            if (this.hoverMenu) {
                this.hoverMenu.dispose();
            }

            this.hoverMenu = new Popover(this.overlay.getElement(), {
                animation: false,
                container: this.overlay.getElement(),
                content: this.$refs.routingHoverMenuContent.innerHTML,
                html: true,
                placement: "top"
            });

            if (this.selectedArea) {
                this.hoverMenu.show();
                this.configHoverMenu();
            }
        },

        /**
         * Applies some configuration options on the hover menu
         * @returns {void}
         */
        configHoverMenu () {
            this.$refs.routingHoverMenu.querySelector(".popover").style.width = "200px";

            if (this.isochronesSettings.attributes.includes("total_pop")) {
                // set population data
                this.$refs.populationDescription.innerHTML = i18next.t("common:modules.routing.isochrones.hoverMenu.population");
                this.$refs.populationValue.innerHTML = this.selectedArea.values_.population.toLocaleString();
            }

            if (this.isochronesSettings.attributes.includes("area")) {
                // set area data
                this.$refs.areaDescription.innerHTML = i18next.t("common:modules.routing.isochrones.hoverMenu.area");
                this.$refs.areaValue.innerHTML = `${Math.round(this.selectedArea.values_.area).toLocaleString()} ${this.isochronesSettings.areaUnit}²`;
            }
        },

        /**
         * Gets style of selected Feature
         * @param {Feature} feature of isochrone area
         * @returns {Style} style of selected feature
         */
        getSelectedStyle (feature) {
            const style = new Style({
                fill: new Fill({
                    color: feature.values_.color
                }),
                stroke: new Stroke({
                    color: "rgba(0, 0, 0)",
                    width: 2
                })
            });

            return style;
        },

        /**
         * Gets map on which the popover should be displayed on
         * @returns {Object} map on which the popover should be displayed on
         */
        getMap () {
            return mapCollection.getMap("2D");
        }
    }
};
</script>

<template>
    <div
        id="routing-hover-menu"
        ref="routingHoverMenu"
    >
        <div
            id="routing-hover-menu-content"
            ref="routingHoverMenuContent"
        >
            <div
                v-if="isochronesSettings.attributes.includes('total_pop')"
                class="d-flex justify-content-between"
            >
                <b>
                    <span
                        id="population-description"
                        ref="populationDescription"
                    />
                </b>
                <b>
                    <span
                        id="population-value"
                        ref="populationValue"
                    />
                </b>
            </div>
            <hr v-if="isochronesSettings.attributes.length > 1">
            <div
                v-if="isochronesSettings.attributes.includes('area')"
                class="d-flex justify-content-between"
            >
                <b>
                    <span
                        id="area-description"
                        ref="areaDescription"
                    />
                </b>
                <b>
                    <span
                        id="area-value"
                        ref="areaValue"
                    />
                </b>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#routing-hover-menu-content {
    display: none;
}

</style>
