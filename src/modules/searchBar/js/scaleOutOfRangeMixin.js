import {mapGetters} from "vuex";
import thousandsSeparator from "@shared/js/utils/thousandsSeparator.js";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList.js";

export default (containerName) => ({
    computed: {
        ...mapGetters("Maps", ["scale", "mode"]),

        /**
         * @returns {object[]} raw layers of this tree item; empty if none
         */
        rawLayers () {
            const ids = (this[containerName].id ?? "").split("-");

            return ids
                .map((id) => rawLayerList.getLayerWhere({id}) ?? null)
                .filter((rawLayer) => Boolean(rawLayer));
        },

        /**
         * @returns {[number, number]} [minScale, maxScale] across all layers
         */
        rawLayersScaleBoundaries () {
            return this.rawLayers.reduce(
                ([accumulatorMinScale, accumulatorMaxScale], current) => {
                    const currentMinScale = parseInt(current.minScale, 10),
                        currentMaxScale = parseInt(current.maxScale, 10);

                    return [
                        isNaN(currentMinScale)
                            ? accumulatorMinScale
                            : Math.min(currentMinScale, accumulatorMinScale ?? Number.POSITIVE_INFINITY),
                        isNaN(currentMaxScale)
                            ? accumulatorMaxScale
                            : Math.max(currentMaxScale, accumulatorMaxScale ?? Number.NEGATIVE_INFINITY)
                    ];
                },
                [undefined, undefined]
            );
        },

        /**
         * @returns {string} if layer is scale-restricted, tooltip text; else, empty string
         */
        tooltipText () {
            const [minScale, maxScale] = this.rawLayersScaleBoundaries;

            if (typeof maxScale !== "undefined" && typeof minScale !== "undefined") {
                return this.$t("common:modules.layerTree.invisibleLayer", {
                    minScale: "1 : " + thousandsSeparator(minScale),
                    maxScale: "1 : " + thousandsSeparator(maxScale, ".")
                });
            }
            else if (typeof maxScale !== "undefined" || typeof minScale !== "undefined") {
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

            const [minScale, maxScale] = this.rawLayersScaleBoundaries;

            return (
                this.scale < (isNaN(minScale) ? Number.NEGATIVE_INFINITY : minScale) ||
                this.scale > (isNaN(maxScale) ? Number.POSITIVE_INFINITY : maxScale)
            );
        }
    }
});
