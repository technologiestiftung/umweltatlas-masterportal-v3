import {mapGetters} from "vuex";
import thousandsSeparator from "@shared/js/utils/thousandsSeparator";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

export default (containerName) => ({
    computed: {
        ...mapGetters("Maps", ["scale", "mode"]),

        /**
         * @returns {(object|null)} raw layer of this tree item, or null
         */
        rawLayer () {
            return rawLayerList.getLayerWhere({id: this[containerName].id}) ?? null;
        },

        /**
         * @returns {string} if layer is scale-restricted, tooltip text; else, empty string
         */
        tooltipText () {
            const {minScale, maxScale} = this.rawLayer ?? {};

            if (maxScale && minScale) {
                return this.$t("common:modules.layerTree.invisibleLayer", {
                    minScale: "1 : " + thousandsSeparator(parseInt(minScale, 10)),
                    maxScale: "1 : " + thousandsSeparator(parseInt(maxScale, 10), ".")
                });
            }
            else if (maxScale || minScale) {
                return this.$t("common:modules.layerTree.invisibleLayerNoScale");
            }

            return "";
        },

        /**
         * True if layer is currently out of range for display on map. In 3D mode,
         * this is never true, in the same fashion as in the layer tree.
         * @returns {boolean} whether layer scale is currently not met
         */
        scaleIsOutOfRange () {
            if (this.mode === "3D") {
                return false;
            }

            const {minScale, maxScale} = this.rawLayer ?? {},
                parsedMinScale = parseInt(minScale, 10),
                parsedMaxScale = parseInt(maxScale, 10);

            return (
                this.scale > (isNaN(parsedMaxScale) ? Number.POSITIVE_INFINITY : parsedMaxScale) ||
                this.scale < (isNaN(parsedMinScale) ? Number.NEGATIVE_INFINITY : parsedMinScale)
            );
        }
    }
});
