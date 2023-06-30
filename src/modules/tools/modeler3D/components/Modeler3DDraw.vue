<script>
import Modeler3DList from "./Modeler3DList.vue";
import * as constants from "../store/constantsModeler3D";
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";

let eventHandler = null;

export default {
    name: "Modeler3DDraw",
    components: {
        Modeler3DList
    },
    data () {
        return {
            drawingMode: "polygon",
            activeShape: null,
            floatingPoint: null,
            isHovering: false,
            constants: constants
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters))
    },
    mounted () {
        this.setSelectedFillColor(constants.colorOptions[0].color);
        this.setSelectedOutlineColor(constants.colorOptions[0].color);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        draw () {
            const scene = this.scene,
                activeShapePoints = [];
            let floatingPoint;

            this.setIsDrawing(true);
            eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            eventHandler.setInputAction((event) => {
                const ray = scene.camera.getPickRay(event.position),
                    earthPosition = scene.globe.pick(ray, scene);

                if (Cesium.defined(earthPosition)) {
                    if (activeShapePoints.length === 0) {
                        floatingPoint = this.createPoint(earthPosition);
                        activeShapePoints.push(earthPosition);
                        const dynamicPositions = new Cesium.CallbackProperty(() => {
                            if (this.drawingMode === "polygon") {
                                return new Cesium.PolygonHierarchy(activeShapePoints);
                            }
                            return activeShapePoints;
                        }, false);

                        this.drawShape(dynamicPositions);
                    }
                    activeShapePoints.push(earthPosition);
                    this.createPoint(earthPosition);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            eventHandler.setInputAction((event) => {
                if (Cesium.defined(floatingPoint)) {
                    const ray = scene.camera.getPickRay(event.endPosition),
                        newPosition = scene.globe.pick(ray, scene);

                    if (Cesium.defined(newPosition)) {
                        floatingPoint.position.setValue(newPosition);
                        activeShapePoints.pop();
                        activeShapePoints.push(newPosition);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(() => {
                this.terminateShape();
                this.setIsDrawing(false);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
        terminateShape () {
            this.removeDrawnPoints();
            eventHandler.destroy();
        },
        createPoint (worldPosition) {
            const point = this.entities.add({
                position: worldPosition,
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 5,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            });

            return point;
        },
        removeDrawnPoints () {
            const pointEntities = this.entities.values.filter(entity => entity.point);

            pointEntities.forEach(entity => {
                this.entities.remove(entity);
            });
        },
        drawShape (positionData) {
            const entities = this.entities,
                models = this.drawnModels,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                entity = {
                    id: lastId ? lastId + 1 : 1
                };
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
                    id: entity.id,
                    name: this.drawName,
                    wasDrawn: true,
                    polygon: {
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color[this.selectedFillColor].withAlpha(this.opacity)
                        ),
                        outline: true,
                        outlineWidth: 1,
                        outlineColor: Cesium.Color[this.selectedOutlineColor].withAlpha(this.opacity),
                        extrudedHeight: this.extrudedHeight
                    }
                });
            }
            models.push({
                id: entity.id,
                name: this.drawName,
                show: true,
                edit: false
            });
            this.setDrawnModels(models);
            return shape;
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
                feature.properties.extrudedHeight = polygon.extrudedHeight._value;

                array.push(coords);
                feature.geometry.coordinates = array;
                features.push(feature);
            });

            jsonGlob.features = features;

            this.downloadGeoJson(JSON.stringify(jsonGlob));
        },
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
                        class="btn btn-sm"
                        :class="'btn-primary'"
                        @click="draw"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-pencil-fill" />
                        </span>
                        {{ $t("modules.tools.modeler3D.draw.captions.beginModelling") }}
                    </button>
                </div>
            </div>
        </div>
        <Modeler3DList
            v-if="drawnModels.length > 0"
            id="drawn-models"
            :objects="drawnModels"
            :objects-label="$t('modules.tools.modeler3D.draw.captions.drawnModels')"
            :entity="true"
            @zoom-to="zoomTo"
            @set-current-model-id="setCurrentModelId"
            @change-visibility="changeVisibility"
            @confirm-deletion="confirmDeletion"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }
</style>
