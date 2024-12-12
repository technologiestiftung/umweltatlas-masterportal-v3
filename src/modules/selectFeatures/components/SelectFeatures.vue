<script>
import {DragBox, Select} from "ol/interaction";
import {platformModifierKeyOnly, touchOnly} from "ol/events/condition";
import VectorSource from "ol/source/Vector.js";
import {Style, Stroke, Fill, Circle as CircleStyle} from "ol/style";

import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSelectFeatures";
import mutations from "../store/mutationsSelectFeatures";

import {isUrl} from "../../../shared/js/utils/urlHelper";
import {isEmailAddress} from "../../../shared/js/utils/isEmailAddress.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../shared/js/utils/isPhoneNumber.js";

export default {
    name: "SelectFeatures",
    data () {
        return {
            selectedFeatureStyle: new Style({
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: "rgba(0, 153, 255, 0.5)"
                    }),
                    stroke: new Stroke({
                        color: "rgba(0, 153, 255, 1)",
                        width: 2
                    })
                }),
                stroke: new Stroke({
                    color: "rgba(0, 153, 255, 1)",
                    width: 2
                }),
                fill: new Fill({
                    color: "rgba(0, 153, 255, 0.3)"
                })
            })
        };
    },
    computed: {
        ...mapGetters(["ignoredKeys", "isMobile"]),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("Modules/SelectFeatures", Object.keys(getters))
    },
    mounted () {
        this.createInteractions();
        this.addInteractions();
    },
    unmounted () {
        this.removeInteractions();
        this.clearSelection();
    },
    methods: {
        ...mapMutations("Modules/SelectFeatures", Object.keys(mutations)),
        ...mapActions("Maps", {
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction"
        }),
        ...mapActions("Modules/SelectFeatures", ["highlightFeature", "toggleFeatureSelection"]),
        isEmailAddress,
        isPhoneNumber,
        getPhoneNumberAsWebLink,

        /**
         * Creates the interactions for selecting features.
         * @returns {void}
         */
        createInteractions: function () {
            const select = new Select({
                    condition: (event) => event.originalEvent.ctrlKey && event.type === "pointerdown",
                    style: null
                }),
                dragBox = new DragBox(this.isMobile ? {condition: touchOnly} : {condition: platformModifierKeyOnly});

            dragBox.on("boxend", this.setFeaturesFromDrag.bind(this));

            select.on("select", (event) => {
                this.setFeaturesFromClick(event.mapBrowserEvent);
            });
            this.setSelectInteraction(select);
            this.setDragBoxInteraction(dragBox);
        },

        /**
         * Entfernt ein einzelnes Feature aus der Auswahl.
         * @param {Number} index - Index des zu entfernenden Features
         * @param {Object} feature - Das Feature-Objekt
         * @returns {void}
         */
        removeFeature (index, feature) {
            if (feature) {
                feature.setStyle(null);
                this.selectedFeatures.splice(index, 1);
                this.selectedFeaturesWithRenderInformation.splice(index, 1);
            }
        },

        /**
         * Leert die komplette Feature-Auswahl.
         * @returns {void}
         */
        clearSelection: function () {
            if (this.selectedFeatures) {
                this.selectedFeatures.forEach(feature => feature.setStyle(null));
                this.setSelectedFeatures([]);
            }
            this.setSelectedFeaturesWithRenderInformation([]);
        },

        /**
         * Interaktionen zur Karte hinzufügen.
         * @returns {void}
         */
        addInteractions: function () {
            this.addInteractionToMap(this.dragBoxInteraction);
            this.addInteractionToMap(this.selectInteraction);
        },

        /**
         * Interaktionen von der Karte entfernen.
         * @returns {void}
         */
        removeInteractions: function () {
            this.removeInteractionFromMap(this.dragBoxInteraction);
            this.removeInteractionFromMap(this.selectInteraction);
            this.selectedFeaturesWithRenderInformation.length = 0;
        },

        /**
         * Erfasst Features innerhalb der gezogenen Box.
         * @returns {void}
         */
        setFeaturesFromDrag: function () {
            const map = mapCollection.getMap("2D"),
                extent = this.dragBoxInteraction.getGeometry().getExtent();

            map.getLayers()
                .getArray()
                .filter(layer => layer.get("visible") && layer.get("source") instanceof VectorSource)
                .forEach(layer => {
                    if (layer.get("typ") === "VectorTile" && layer.get("renderer") === "webgl") {
                        const features = layer.get("source")?.getFeaturesInExtent(extent);

                        features.forEach(feature => {
                            const featureId = feature.getId(),
                                alreadySelected = this.selectedFeatures.some(f => f.getId() === featureId);

                            if (!alreadySelected) {
                                feature.setStyle(this.selectedFeatureStyle);
                                this.prepareFeature(layer, feature);
                            }
                        });
                    }
                    else {
                        layer.get("source").forEachFeatureIntersectingExtent(
                            extent,
                            feature => {
                                const featureId = feature.getId(),
                                    alreadySelected = this.selectedFeatures.some(f => f.getId() === featureId);

                                if (!alreadySelected) {
                                    feature.setStyle(this.selectedFeatureStyle);
                                    this.prepareFeature(layer, feature);
                                }
                            }
                        );
                    }
                });
        },

        /**
         * Erfasst ein Feature per Klick (Strg+Klick).
         * @param {Object} event Klick-Event
         * @returns {void}
         */
        setFeaturesFromClick: function (event) {
            const map = mapCollection.getMap("2D"),
                coordinate = event.coordinate,
                pixel = map.getPixelFromCoordinate(coordinate);

            map.forEachFeatureAtPixel(pixel, (feature, layer) => {
                if (!layer) {
                    console.warn("No layer found for feature", feature);
                    return true;
                }

                if (layer.get("visible") && layer.get("source") instanceof VectorSource) {
                    const featureId = feature.getId(),
                        alreadySelected = this.selectedFeatures.some(f => f.getId() === featureId);

                    if (!alreadySelected) {
                        feature.setStyle(this.selectedFeatureStyle);
                        this.prepareFeature(layer, feature);
                    }
                }
                else {
                    console.warn("Layer not visible or not a vector source", layer);
                }
                return true;
            });
        },

        /**
         * Bereitet Features für die Auswahl vor und fügt sie hinzu.
         * @param {module:ol/Layer} layer Layer des Features
         * @param {module:ol/Feature} feature Das Feature
         * @returns {void}
         */
        prepareFeature: function (layer, feature) {
            this.addSelectedFeature(feature);
            if (feature.get("features") === undefined) {
                this.pushFeatures(layer, feature);
            }
            else {
                feature.get("features").forEach(item => {
                    this.pushFeatures(layer, item);
                });
            }
        },

        /**
         * Fügt ein Feature zur ausgewählten Liste hinzu, falls es noch nicht vorhanden ist.
         * @param {module:ol/Feature} feature
         * @returns {void}
         */
        addSelectedFeature: function (feature) {
            const featureId = feature.getId();

            if (this.selectedFeatures.some(f => f.getId() === featureId)) {
                return;
            }
            this.selectedFeatures.push(feature);
        },

        /**
         * Fügt ein Feature mit Render-Informationen hinzu.
         * @param {Object} layer Layer
         * @param {module:ol/Feature} item Feature
         * @returns {void}
         */
        pushFeatures: function (layer, item) {
            this.addSelectedFeatureWithRenderInformation({
                item,
                properties: this.translateGFI(
                    item.getProperties(),
                    layer.get("gfiAttributes")
                ),
                layerId: layer.get("id")
            });
        },

        processLinksAndBreaks: function (properties) {
            const resultProperties = properties;

            Object.entries(properties).forEach(([key, propValue]) => {
                let propertyValue = propValue;

                if (Array.isArray(propValue)) {
                    propertyValue = propValue.join("|");
                }
                if (this.isValidKey(key) && this.isValidValue(propertyValue) && propertyValue.indexOf("|") > -1) {
                    resultProperties[key] = "";
                    propertyValue.split("|").forEach(arrayItemValue => {
                        if (isUrl(arrayItemValue)) {
                            resultProperties[key] += `<a href="${arrayItemValue}" target="_blank">${arrayItemValue}</a><br/>`;
                        }
                        else {
                            resultProperties[key] += arrayItemValue + "<br/>";
                        }
                    });
                }
                else if (this.isValidKey(key) && this.isValidValue(propertyValue) && isUrl(propertyValue)) {
                    resultProperties[key] = `<a href="${propertyValue}" target="_blank">${propertyValue}</a>`;
                }
            });
            return resultProperties;
        },

        translateGFI: function (properties, gfiAttributes) {
            const resultProperties = this.processLinksAndBreaks(properties);

            if (gfiAttributes === "showAll") {
                return Object
                    .entries(resultProperties)
                    .map(([key, value]) => {
                        if (this.isValidKey(key) && this.isValidValue(value)) {
                            return [this.beautifyKey(key), this.beautifyValue(value)];
                        }
                        return false;
                    });
            }

            if (typeof gfiAttributes === "object") {
                return Object
                    .keys(gfiAttributes)
                    .map(key => [
                        gfiAttributes[key],
                        this.beautifyValue(resultProperties[key] || "")
                    ]);
            }

            if (gfiAttributes !== "ignore") {
                console.warn(`Layer has invalid gfiAttributes "${gfiAttributes}". Acting as if "ignore" was given.`);
            }

            return [];
        },

        beautifyKey: function (str) {
            if (typeof str !== "string") {
                console.warn("Invalid input for beautifyKey. Expected a string, got:", typeof str);
                return "";
            }
            return str
                .split("_")
                .map(item => item.substring(0, 1).toUpperCase() + item.substring(1))
                .join(" ");
        },

        beautifyValue: function (str) {
            if (typeof str !== "string") {
                console.warn("Invalid input for beautifyValue. Expected a string, got:", typeof str);
                return "";
            }
            return str
                .split("|")
                .map(item => item.trim())
                .join("<br/>");
        },

        isValidKey: function (key) {
            return this.ignoredKeys.indexOf(key.toUpperCase()) === -1;
        },

        isValidValue: function (str) {
            return Boolean(str && typeof str === "string" && str.toUpperCase() !== "NULL");
        },

        featureZoom: function (event) {
            const map = mapCollection.getMap("2D"),
                featureIndex = event.currentTarget.id.split("-")[0],
                selected = this.selectedFeaturesWithRenderInformation[featureIndex];

            map.getView().fit(selected.item.getGeometry());
            this.highlightFeature({feature: selected.item, layerId: selected.layerId});
        },

        translate (key, options = null) {
            if (key === "common:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the common translation");
            }
            return this.$t(key, options);
        }
    }
};
</script>

<template lang="html">
    <div
        id="selectFeatures"
    >
        <div
            v-if="selectedFeaturesWithRenderInformation.length === 0"
            class="selectFeaturesDefaultMessage"
        >
            {{ translate("common:modules.selectFeatures.noFeatureChosen") }}
        </div>
        <div
            v-else
            ref="select-features-tables"
            class="select-features-tables"
        >
            <div class="sticky-clear-container">
                <button
                    class="btn btn-primary btn-sm"
                    @click="clearSelection"
                >
                    {{ translate("common:modules.selectFeatures.clearSelection") }}
                </button>
            </div>
            <br>
            <template
                v-for="(selectedFeature, index) in selectedFeaturesWithRenderInformation"
                :key="index"
            >
                <table
                    v-if="selectedFeature.properties.length > 0"
                    class="table table-striped table-bordered"
                >
                    <tbody>
                        <tr
                            v-for="(property, propIndex) in selectedFeature.properties"
                            :key="propIndex"
                        >
                            <td class="featureName">
                                {{ property[0] }}
                            </td>
                            <td
                                v-if="isEmailAddress(property[1])"
                                class="featureValue"
                            >
                                <a :href="`mailto:${property[1]}`">{{ property[1] }}</a>
                            </td>
                            <td
                                v-else-if="isPhoneNumber(property[1])"
                                class="featureValue"
                            >
                                <a :href="getPhoneNumberAsWebLink(property[1])">{{ property[1] }}</a>
                            </td>
                            <td
                                v-else-if="property[1] && (property[1].includes('<br') || property[1].includes('<a'))"
                                class="featureValue"
                                v-html="property[1]"
                            />
                            <td
                                v-else
                                class="featureValue"
                            >
                                {{ property[1] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p
                    v-else
                    :key="index + 'z'"
                >
                    {{ translate("common:modules.selectFeatures.propertylessFeature") }}
                </p>
                <div
                    class="feature-actions"
                >
                    <a
                        :id="index + '-selectFeatures-feature'"
                        :key="'a' + index"
                        href="#"
                        class="select-features-zoom-link"
                        @click="featureZoom"
                    >
                        {{ translate("common:modules.selectFeatures.zoomToFeature") }}
                    </a>
                    <button
                        class="btn btn-link btn-sm remove-feature-btn"
                        @click="removeFeature(index, selectedFeature.item)"
                    >
                        {{ translate("common:modules.selectFeatures.deselectFeature") }}
                    </button>
                </div>
                <hr
                    v-if="index !== selectedFeaturesWithRenderInformation.length - 1"
                    :key="'h' + index"
                >
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
.selectFeatures {
    max-width: 600px;
    max-height: 745px;
}

.select-features-tables {
    overflow-y: auto;
    max-height: 600px;
    position: relative;
}

.feature-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
}

.remove-feature-btn {
    color: red;
    cursor: pointer;
    font-size: 0.875rem;
    margin-left: 10px;
}

.sticky-clear-container {
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 10;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

td.featureName {
    width: 30%;
}

td.featureValue {
    width: 70%;
}
</style>
