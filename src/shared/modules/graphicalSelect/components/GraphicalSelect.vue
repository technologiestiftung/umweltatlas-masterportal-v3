<script>
import definitionsGraphicalSelect from "@shared/modules/graphicalSelect/js/definitionsGraphicalSelect.js";
import {mapGetters, mapActions, mapMutations} from "vuex";
import Draw, {createBox} from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Circle, Polygon} from "ol/geom.js";
import Feature from "ol/Feature.js";
import GeoJSON from "ol/format/GeoJSON.js";
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js";
import {BufferOp} from "jsts/org/locationtech/jts/operation/buffer";
import GeoJSONWriter from "jsts/org/locationtech/jts/io/GeoJSONWriter.js";

export default {
    name: "GraphicalSelect",
    props: {
        // The used template element for graphical selection
        selectElement: {
            type: String,
            required: false,
            default: "Dropdown"

        },
        // preselected draw modus
        selectedOption: {
            type: String,
            required: false,
            default: "Box"

        },
        // The keys corresponds to the ol draw modus
        // and the values to the elements text content.
        options: {
            type: Object,
            required: false,
            default: undefined
        },
        // if focus should be set to this component when it is created
        focusOnCreation: {
            type: Boolean,
            default: false,
            required: false
        },
        // The label of the select
        label: {
            type: String,
            required: true
        },
        // The description over the select
        description: {
            type: String,
            default: "",
            required: false
        },
        // Use existing geometry
        startGeometry: {
            type: Object,
            required: false,
            default: undefined
        },
        // Buffer distance for line geometries in meters
        bufferDistance: {
            type: Number,
            required: false,
            default: 100
        }
    },
    data () {
        return {
            selectedOptionData: this.selectedOption,
            circleOverlay: definitionsGraphicalSelect.circleOverlay,
            tooltipOverlay: definitionsGraphicalSelect.tooltipOverlay,
            drawInteraction: definitionsGraphicalSelect.drawInteraction,
            bufferDistanceData: this.bufferDistance,
            lineDrawn: false,
            currentLineGeometry: null
        };
    },
    computed: {
        ...mapGetters("Modules/GraphicalSelect", [
            "active",
            "geographicValues",
            "selectionElements"

        ]),
        optionsValue: function () {
            return this.options ? this.options : {
                "Box": this.$t("common:shared.modules.graphicalSelect.selectBySquare"),
                "Circle": this.$t("common:shared.modules.graphicalSelect.selectByCircle"),
                "Polygon": this.$t("common:shared.modules.graphicalSelect.selectByPolygon"),
                "Line": this.$t("common:shared.modules.graphicalSelect.selectByLine")
            };
        }
    },

    /**
     * Mounted hook:
     * @returns {void}
     */
    mounted () {
        this.setActive(true);
        this.selectedOptionData = this.selectedOption;
        this.createDomOverlay({id: "sdp-circle-overlay", overlay: this.circleOverlay});
        this.createDomOverlay({id: "sdp-tooltip-overlay", overlay: this.tooltipOverlay});
        this.createDrawInteraction();
        this.checkOptions();
        this.setDefaultSelection(this.selectedOptionData);
    },
    unmounted () {
        this.setActive(false);
        this.resetView();
    },

    methods: {
        ...mapMutations("Modules/GraphicalSelect", [
            "setDefaultSelection",
            "setActive",
            "setCurrentValue",
            "setBufferDistance",
            "setSelectedAreaGeoJson"
        ]),
        ...mapActions("Modules/GraphicalSelect", [
            "createDomOverlay",
            "showTooltipOverlay",
            "toggleOverlay",
            "updateDrawInteractionListener"
        ]),
        ...mapActions("Maps", [
            "addLayer",
            "addInteraction",
            "removeInteraction",
            "registerListener"
        ]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Handles (de-)activation of this Module
         * @param {Boolean} value flag if module is active
         * @todo Replace if removeOverlay is available in vue
         * @returns {void}
         */
        setStatus: function (value) {
            if (value) {
                this.createDrawInteraction();
            }
            else {
                if (typeof this.drawInteraction === "object") {
                    this.drawInteraction.setActive(false);
                }
                mapCollection.getMap("2D").removeOverlay(this.circleOverlay);
                mapCollection.getMap("2D").removeOverlay(this.tooltipOverlay);
            }
        },

        /**
         * Sets the selection of the dropdown to the default value
         * @returns {void}
         */
        resetGeographicSelection: function () {
            this.selectedOptionData = Object.keys(this.optionsValue)[0];
        },

        /**
         * Check the provided configuration of the graphicalSelect element
         * @returns {void}
         */
        checkOptions: function () {
            if (!Object.keys(this.optionsValue).every(key => this.geographicValues.includes(key))) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedOption") + this.geographicValues
                });
            }

            if (!this.geographicValues.includes(this.selectedOption)) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedSelection") + this.geographicValues
                });
            }

            if (!this.selectionElements.includes(this.selectElement)) {
                this.addSingleAlert({
                    "content": this.$t("common:shared.modules.graphicalSelect.alert.notSupportedElement") + this.selectionElements
                });
            }
        },

        /**
         * Reset the map view by clearing geometries and removing overlays and interactions.
         * This method clears the vector source, removes the layer from the map,
         * removes the draw interaction, and clears the content of the overlays.
         * @returns {void}
         */
        async resetView () {
            const map = mapCollection.getMap("2D");

            if (this.layer) {
                this.layer.getSource().clear();
                map.removeLayer(this.layer);
            }

            if (this.draw) {
                this.removeInteraction(this.draw);
            }

            if (this.circleOverlay && this.circleOverlay.element) {
                this.circleOverlay.element.innerHTML = "";
            }

            map.removeOverlay(this.circleOverlay);
            map.removeOverlay(this.tooltipOverlay);
        },

        /**
         * Rounds the circle radius.
         * @param {Number} radius circle radius
         * @return {String} the rounded radius
         */
        roundRadius: function (radius) {
            if (radius > 500) {
                return (Math.round(radius / 1000 * 100) / 100) + " km";
            }
            return (Math.round(radius * 10) / 10) + " m";
        },

        /**
         * Calculates the circle radius and places the circle overlay on geometry change.
         * @param {Number} radius - circle radius
         * @param {Number[]} coords - point coordinate
         * @returns {void}
         */
        showOverlayOnSketch: function (radius, coords) {
            const circleOverlay = this.circleOverlay;

            circleOverlay.element.innerHTML = this.roundRadius(radius);
            circleOverlay.setPosition(coords);
        },

        /**
         * Rounds the given number with the given precision.
         * @param {Number} number to round
         * @param {Number} precision exponent
         * @returns {Number} the rounded number
         */
        precisionRound: function (number, precision) {
            const factor = Math.pow(10, precision);

            return Math.round(number * factor) / factor;
        },

        /**
         * If drawtype == "Circle" set the radius to the circle-geometry
         * @param {*} coordinates array of coordinates to get the radius from
         * @param {*} opt_geom optional existing geometry
         * @returns {*} the optional existing geometry or a circle geometry
         */
        snapRadiusToInterval: function (coordinates, opt_geom) {
            let radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2));

            radius = this.precisionRound(radius, -1);
            const geometry = opt_geom || new Circle(coordinates[0]);

            geometry.setRadius(radius);

            this.showOverlayOnSketch(radius, coordinates[1]);
            return geometry;
        },

        /**
         * Handles the line drawing end event and creates a buffer around the line
         * @param {Object} evt - Draw end event
         * @returns {void}
         */
        handleLineDrawEnd: function (evt) {
            const feature = evt.feature,
                geometry = feature.getGeometry();

            if (!geometry) {
                return;
            }

            this.currentLineGeometry = geometry.clone();
            this.lineDrawn = true;
            this.createBufferFromLine(geometry);
        },

        /**
         * Creates a buffer around a line geometry
         * @param {ol.geom.Geometry} geometry - The line geometry to buffer
         * @param {Boolean} triggerEvent - Whether to trigger the onDrawEnd event
         * @returns {void}
         */
        createBufferFromLine: function (geometry, triggerEvent = true) {
            try {
                const geojsonFormat = new GeoJSON(),
                    geojson = geojsonFormat.writeGeometry(geometry),
                    reader = new GeoJSONReader(),
                    jstsGeom = reader.read(geojson),
                    buffered = BufferOp.bufferOp(jstsGeom, this.bufferDistanceData),
                    writer = new GeoJSONWriter(),
                    bufferedGeojson = writer.write(buffered);

                let coordinates;

                if (bufferedGeojson.type === "MultiPolygon") {
                    const outerRing = bufferedGeojson.coordinates[0][0],
                        innerRings = [];

                    bufferedGeojson.coordinates.forEach((poly, index) => {
                        if (index === 0) {
                            innerRings.push(...poly.slice(1));
                        }
                        else {
                            innerRings.push(...poly);
                        }
                    });
                    coordinates = [outerRing, ...innerRings];
                }
                else if (bufferedGeojson.type === "Polygon") {
                    coordinates = bufferedGeojson.coordinates;
                }
                else {
                    throw new Error(`Unexpected geometry type: ${bufferedGeojson.type}`);
                }

                if (coordinates) {
                    const polygonFeature = new Feature({
                            geometry: new Polygon(coordinates)
                        }),
                        polygonGeoJson = {
                            type: "Polygon",
                            coordinates: coordinates
                        };

                    this.layer.getSource().clear();
                    this.layer.getSource().addFeature(polygonFeature);
                    this.setSelectedAreaGeoJson(polygonGeoJson);

                    if (triggerEvent) {
                        this.$parent.$emit("onDrawEnd", polygonGeoJson);
                    }
                }
            }
            catch (error) {
                console.error("Error creating buffer:", error);
            }
        },

        /**
         * Updates the buffer when the buffer distance changes (during slider movement)
         * @param {Event} event - Input event with new buffer distance
         * @returns {void}
         */
        updateBufferDistance: function (event) {
            const newValue = Number(event.target.value);

            if (isNaN(newValue) || newValue < 1) {
                return;
            }
            this.bufferDistanceData = newValue;
            this.setBufferDistance(newValue);

            if (this.lineDrawn && this.currentLineGeometry) {
                this.createBufferFromLine(this.currentLineGeometry, false);
            }
        },
        /**
         * Finalizes the buffer when the slider is released
         * @returns {void}
         */
        finalizeBufferDistance: function () {
            if (this.lineDrawn && this.currentLineGeometry) {
                this.createBufferFromLine(this.currentLineGeometry, true);
            }
        },

        /**
         * Applies the current buffer distance to the line
         * @returns {void}
         */
        applyLineBuffer: function () {
            if (this.lineDrawn && this.currentLineGeometry) {
                this.createBufferFromLine(this.currentLineGeometry, true);
            }
        },

        /**
         * Reset the state when switching to a different drawing type
         * @returns {void}
         */
        resetLineState: function () {
            this.lineDrawn = false;
            this.currentLineGeometry = null;
        },

        /**
         * Create the draw interaction Box|Circle|Polygon|Line
         * @todo Replace if removeOverlay and pointermove is available in vue
         * @returns {void}
         */
        createDrawInteraction: function () {
            const geometryFunction = createBox(),
                drawtype = this.selectedOptionData;

            this.resetLineState();

            if (this.layer && !this.startGeometry) {
                this.resetView(this.layer);
            }
            else if (this.startGeometry) {
                if (this.layer) {
                    this.layer?.getSource().clear();
                    mapCollection.getMap("2D").removeLayer(this.layer);
                }

                this.removeInteraction(this.draw);

                const polygonSource = new VectorSource({
                    features: [new Feature({
                        geometry: this.startGeometry
                    })]
                });

                this.layer = new VectorLayer({
                    id: "geometry_selection_layer",
                    name: "Geometry-Selection",
                    source: polygonSource,
                    alwaysOnTop: true
                });
            }
            else {
                this.layer = new VectorLayer({
                    id: "geometry_selection_layer",
                    name: "Geometry-Selection",
                    source: new VectorSource(),
                    alwaysOnTop: true
                });
            }

            // createBox() and type: 'Circle' return a box instead of a circle geometry
            this.draw = new Draw({
                source: this.layer.getSource(),
                type: this.getDrawType(drawtype),
                geometryFunction: drawtype === "Polygon" || drawtype === "Line" ? undefined : (coordinates, opt_geom) => {
                    if (drawtype === "Box") {
                        return geometryFunction(coordinates, opt_geom);
                    }
                    return this.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

            if (drawtype === "Line") {
                this.draw.on("drawend", this.handleLineDrawEnd);
            }

            this.addInteraction(this.draw);
            this.setCurrentValue(drawtype);
            this.toggleOverlay({type: drawtype, overlayCircle: this.circleOverlay, overlayTool: this.tooltipOverlay});
            this.updateDrawInteractionListener({interaction: this.draw, layer: this.layer, vm: this});
            this.drawInteraction = this.draw;
            this.registerListener({type: "pointermove", listener: this.showTooltipOverlay});
            if (!mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === this.layer.get("id"))) {
                this.addLayer(this.layer);
            }
        },

        /**
         * Determines the draw type for OpenLayers based on the selected option
         * @param {String} drawtype - The selected draw type
         * @returns {String} The OpenLayers draw type
         */
        getDrawType: function (drawtype) {
            if (drawtype === "Box") {
                return "Circle";
            }
            else if (drawtype === "Line") {
                return "LineString";
            }
            return drawtype;
        }
    }
};
</script>

<template>
    <label
        v-if="description !== ''"
        for="graphicalSelect"
        class="form-floating mb-2"
    >
        {{ $t(description) }}
    </label>
    <div class="form-floating mb-3">
        <select
            id="graphicalSelect"
            class="form-select"
            :aria-label="label"
            @change="selectedOptionData=$event.target.value;createDrawInteraction()"
        >
            <option
                v-for="(value, i) in optionsValue"
                :key="i"
                :value="i"
                :selected="optionsValue[0]"
            >
                {{ value }}
            </option>
        </select>
        <label for="graphicalSelect">
            {{ $t(label) }}
        </label>
    </div>
    <!-- Buffer distance control - only visible when Line is selected and drawn -->
    <div v-if="selectedOptionData === 'Line' && lineDrawn" class="mb-3">
        <label for="buffer-distance" class="form-label">Buffer-Distanz (Meter):</label>
        <div class="d-flex align-items-center">
            <input
                type="range"
                class="form-range me-2"
                id="buffer-distance"
                min="1"
                max="1000"
                step="1"
                :value="bufferDistanceData"
                @input="updateBufferDistance"
                @change="finalizeBufferDistance"
                style="flex-grow: 1;"
            />
            <input
                type="number"
                class="form-control"
                min="1"
                max="1000"
                :value="bufferDistanceData"
                @input="updateBufferDistance"
                @change="finalizeBufferDistance"
                style="width: 80px;"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
 @import "~variables";
</style>
