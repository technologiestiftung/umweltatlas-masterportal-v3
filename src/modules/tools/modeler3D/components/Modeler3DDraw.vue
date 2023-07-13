<script>
import EntityList from "./ui/EntityList.vue";
import * as constants from "../store/constantsModeler3D";
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import proj4 from "proj4";
import {adaptCylinderToPolygon, adaptCylinderToGround, adaptCylinderUnclamped} from "./utils/draw";

let eventHandler = null;

export default {
    name: "Modeler3DDraw",
    components: {
        EntityList
    },
    data () {
        return {
            clampToGround: true,
            constants: constants,
            currentPosition: null,
            drawingMode: "polygon",
            shapeId: null
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["altitude", "mouseCoordinate"])
    },
    mounted () {
        this.setSelectedFillColor(constants.colorOptions[0].color);
        this.setSelectedOutlineColor(constants.colorOptions[0].color);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        /**
         * Called if button in UI is pressed. Starts the drawing process.
         * @returns {void}
         */
        startDrawing () {
            this.setIsDrawing(true);
            this.shapeId = null;
            this.createCylinder({
                posIndex: this.activeShapePoints.length
            });

            const scene = this.scene,
                floatingPoint = this.entities.values.find(cyl => cyl.id === this.cylinderId);

            this.currentPosition = new Cesium.Cartesian3(1, 1, 1);
            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => adaptCylinderUnclamped(floatingPoint, this.currentPosition), false);

            eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.addPolygonPosition, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            eventHandler.setInputAction(this.stopDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
        /**
         * Called on mouse move. Repositions the current pin to set the position.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        onMouseMove (event) {
            const scene = this.scene,
                floatingPoint = this.entities.values.find(cyl => cyl.id === this.cylinderId);

            if (this.clampToGround) {
                const ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                this.currentPosition = position;
            }
            else {
                const transformedCoordinates = proj4(proj4("EPSG:25832"), proj4("EPSG:4326"), [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                    cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]),
                    polygon = this.entities.values.find(ent => ent.id === this.currentModelId),
                    ignoreObjects = polygon ? [floatingPoint, polygon] : [floatingPoint];

                cartographic.height = scene.sampleHeight(cartographic, ignoreObjects);

                this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
            }
            if (Cesium.defined(this.currentPosition)) {
                this.activeShapePoints.splice(floatingPoint.positionIndex, 1, this.currentPosition);
            }
        },
        /**
         * Called on mouse leftclick. Sets the position of a pin and starts to draw polygon with 2 set pins.
         * @returns {void}
         */
        addPolygonPosition () {
            let floatingPoint = this.entities.values.find(cyl => cyl.id === this.cylinderId);

            if (this.activeShapePoints.length === 2) {
                this.drawShape();
            }
            const polygon = this.entities.getById(this.shapeId);

            if (this.clampToGround) {
                floatingPoint.position = adaptCylinderToGround(floatingPoint, this.currentPosition);
                this.createCylinder({
                    posIndex: this.activeShapePoints.length
                });
            }
            else {
                floatingPoint.position = adaptCylinderToPolygon(polygon, floatingPoint, this.currentPosition);

                this.createCylinder({
                    posIndex: this.activeShapePoints.length,
                    length: polygon ? this.extrudedHeight + polygon.polygon.height + 5 : undefined
                });
            }
            floatingPoint = this.entities.values.find(cyl => cyl.id === this.cylinderId);
            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => adaptCylinderToPolygon(polygon, floatingPoint, this.currentPosition), false);

            this.activeShapePoints.push(this.currentPosition);
        },
        /**
         * Called on mouse rightclick. Completes the polygon when there are at least 3 corners or deletes it when it has less.
         * @returns {void}
         */
        stopDrawing () {
            const shape = this.entities.getById(this.shapeId);

            if (shape?.polygon && this.activeShapePoints.length > 2) {
                shape.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));
            }
            else if (shape && this.activeShapePoints.length < 3) {
                this.deleteEntity(shape.id);
            }

            this.setActiveShapePoints([]);
            this.removeCylinders();
            this.currentPosition = null;
            this.setIsDrawing(false);
            eventHandler.destroy();
        },
        /**
         * Creates the drawn shape in the EntityCollection and sets its attributes.
         * @returns {void}
         */
        drawShape () {
            const entities = this.entities,
                models = this.drawnModels,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                positionData = new Cesium.CallbackProperty(() => {
                    if (this.drawingMode === "polygon") {
                        return new Cesium.PolygonHierarchy(this.activeShapePoints);
                    }
                    return this.activeShapePoints;
                }, false);
            let shape;

            if (this.drawingMode === "line") {
                shape = this.entities.add({
                    polyline: {
                        positions: positionData,
                        clampToGround: true,
                        width: 3
                    }
                });
            }
            else if (this.drawingMode === "polygon") {
                shape = this.entities.add({
                    id: lastId ? lastId + 1 : 1,
                    name: this.drawName ? this.drawName : i18next.t("common:modules.tools.modeler3D.draw.captions.drawing"),
                    wasDrawn: true,
                    clampToGround: this.clampToGround,
                    polygon: {
                        height: this.clampToGround ? undefined : this.altitude,
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color[this.selectedFillColor].withAlpha(this.opacity)
                        ),
                        outline: true,
                        outlineWidth: 1,
                        outlineColor: Cesium.Color[this.selectedOutlineColor].withAlpha(this.opacity),
                        shadows: Cesium.ShadowMode.ENABLED,
                        extrudedHeight: this.clampToGround ? this.extrudedHeight : this.extrudedHeight + this.altitude,
                        extrudedHeightReference: this.clampToGround ? Cesium.HeightReference.RELATIVE_TO_GROUND : Cesium.HeightReference.NONE
                    }
                });
            }
            models.push({
                id: shape.id,
                name: shape.name,
                show: true,
                edit: false
            });
            this.setDrawnModels(models);
            this.shapeId = shape.id;
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const entities = this.entities,
                entity = entities.getById(id),
                hierarchy = entity.polygon.hierarchy.getValue(),
                positions = hierarchy.positions,
                extrudedHeight = entity.polygon.extrudedHeight.getValue(),
                targetHeight = extrudedHeight + 100,
                boundingSphereCenter = Cesium.BoundingSphere.fromPoints(positions).center,
                centerCartographic = Cesium.Cartographic.fromCartesian(boundingSphereCenter),
                longitude = centerCartographic.longitude,
                latitude = centerCartographic.latitude;

            this.scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(longitude, latitude, targetHeight)
            });
        },
        /**
         * Exports all drawn entities to single GeoJSON file.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        exportToGeoJson () {
            const entities = this.entities,
                drawnEntitiesCollection = [],
                jsonGlob = {"type": "FeatureCollection", "features": []},
                features = [];

            entities.values.forEach(entity => {
                if (!entity.model) {
                    drawnEntitiesCollection.push(entity);
                }
            });

            drawnEntitiesCollection.forEach(entity => {
                const polygon = entity.polygon,
                    positions = polygon.hierarchy.getValue().positions,
                    color = polygon.material.color,
                    outlineColor = polygon.outlineColor.getValue(),
                    feature = {"type": "Feature", "properties": {}, "geometry": {
                        "type": "Polygon", "coordinates": []
                    }},
                    coords = [],
                    array = [];

                positions.forEach(position => {
                    const cartesian = new Cesium.Cartesian3(
                            position.x,
                            position.y,
                            position.z
                        ),
                        cartographic = Cesium.Cartographic.fromCartesian(cartesian),
                        longitude = Cesium.Math.toDegrees(cartographic.longitude),
                        latitude = Cesium.Math.toDegrees(cartographic.latitude),
                        coordXY = [Number(longitude), Number(latitude)];

                    coords.push(coordXY);
                });

                feature.properties.name = entity.name;

                feature.properties.color = {};
                feature.properties.color.red = color._value.red;
                feature.properties.color.green = color._value.green;
                feature.properties.color.blue = color._value.blue;
                feature.properties.color.alpha = color._value.alpha;

                feature.properties.outlineColor = outlineColor;
                feature.properties.height = polygon.height?._value;
                feature.properties.extrudedHeight = polygon.extrudedHeight._value;
                feature.properties.extrudedHeightReference = polygon.extrudedHeightReference._value;

                array.push(coords);
                feature.geometry.coordinates = array;
                features.push(feature);
            });

            jsonGlob.features = features;

            this.downloadGeoJson(JSON.stringify(jsonGlob));
        },
        /**
         * Downloads the exported GeoJSON file
         * @param {JSON} geojson - all entities in a json format.
         * @returns {void}
         */
        downloadGeoJson (geojson) {
            const url = URL.createObjectURL(new Blob([geojson], {type: "application/geo+json"})),
                link = document.createElement("a");

            link.href = url;
            link.download = "export.geojson";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }
    }
};
</script>

<template lang="html">
    <div>
        <div id="modeler3D-draw-tool">
            <form
                class="form-horizontal"
                role="form"
                @submit.prevent
            >
                <div
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="modeler3D-draw-name"
                    >
                        {{ $t("modules.tools.modeler3D.draw.captions.drawName") }}
                    </label>
                    <div class="col-md-7">
                        <input
                            id="modeler3D-draw-name"
                            class="form-control form-control-sm"
                            type="text"
                            :value="drawName"
                            @input="setDrawName($event.target.value)"
                        >
                    </div>
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-modeler3D-extrudedHeight"
                    >
                        {{ $t("modules.tools.modeler3D.draw.captions.extrudedHeight") }}
                    </label>
                    <div class="col-md-7">
                        <input
                            id="tool-modeler3D-extrudedHeight"
                            class="form-control form-control-sm"
                            type="text"
                            :value="extrudedHeight"
                            @input="setExtrudedHeight($event.target.value)"
                        >
                    </div>
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-modeler3D-transparency"
                    >
                        {{ $t("modules.tools.modeler3D.draw.captions.transparency") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-modeler3D-transparency"
                            :key="`tool-modeler3D-transparency-select`"
                            class="form-select form-select-sm"
                            @change="setOpacity(parseFloat($event.target.value))"
                        >
                            <option
                                v-for="option in constants.transparencyOptions"
                                :key="'modeler3D-opacity-option-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-modeler3D-fill-color"
                    >
                        {{ $t("modules.tools.modeler3D.draw.captions.fillColor") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-modeler3D-fill-color"
                            :key="`tool-modeler3D-color-select`"
                            class="form-select form-select-sm"
                            @change="setSelectedFillColor($event.target.value)"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'modeler3D-fill-color-option-' + option.color"
                                :value="option.color"
                            >
                                {{ option.color }}
                            </option>
                        </select>
                    </div>
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-modeler3D-outline-color"
                    >
                        {{ $t("modules.tools.modeler3D.draw.captions.outlineColor") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-modeler3D-outline-color"
                            :key="`tool-modeler3D-outline-color-select`"
                            class="form-select form-select-sm"
                            @change="setSelectedOutlineColor($event.target.value)"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'modeler3D-outline-color-option-' + option.color"
                                :value="option.color"
                            >
                                {{ option.color }}
                            </option>
                        </select>
                    </div>
                </div>
            </form>
            <div class="form-check form-switch cta">
                <input
                    id="clampToGroundSwitch"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="clampToGround"
                    :checked="clampToGround"
                    @change="clampToGround = !clampToGround"
                >
                <label
                    class="form-check-label"
                    for="clampToGroundSwitch"
                >
                    {{ $t("modules.tools.modeler3D.draw.captions.clampToGround") }}
                </label>
            </div>
        </div>
        <hr>
        <div
            class="form-horizontal"
            role="form"
        >
            <div class="form-group form-group-sm row">
                <div class="col-12 d-grid gap-2">
                    <button
                        id="tool-modeler3D-modelling-interaction"
                        class="primary-button-wrapper"
                        @click="startDrawing"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-pencil-fill" />
                        </span>
                        {{ $t("modules.tools.modeler3D.draw.captions.beginModelling") }}
                    </button>
                </div>
            </div>
        </div>
        <EntityList
            v-if="drawnModels.length > 0"
            id="drawn-models"
            :objects="drawnModels"
            :objects-label="$t('modules.tools.modeler3D.draw.captions.drawnModels')"
            :entity="true"
            :geometry="true"
            @change-visibility="changeVisibility"
            @export-geojson="exportToGeoJson"
            @zoom-to="zoomTo"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
    .cta {
        margin-bottom:12px;
    }
    .form-switch {
        font-size: $font_size_big;
    }

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 0.1rem 0.7rem;
        cursor: pointer;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
</style>
