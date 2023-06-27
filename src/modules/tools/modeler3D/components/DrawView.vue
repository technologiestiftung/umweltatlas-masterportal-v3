<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";

let eventHandler = null;

export default {
    name: "DrawView",
    data () {
        return {
            drawingMode: "polygon",
            activeShape: null,
            floatingPoint: null,
            isHovering: false
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters))
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
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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
                    wasDrawn: true,
                    polygon: {
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.GREY.withAlpha(0.8)
                        ),
                        extrudedHeight: 50
                    }
                });
            }
            models.push({
                id: entity.id,
                name: "TestName",
                show: true,
                edit: false
            });
            this.setDrawnModels(models);
            return shape;
        },
        /**
         * Toggles the visibility of a model entity.
         * @param {object} model - The model object.
         * @returns {void}
         */
        changeVisibility (model) {
            const entities = this.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
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
        }

    }
};
</script>

<template lang="html">
    <div id="modeler3D-draw-tool">
        <button @click="draw">
            start draw
        </button>
        <div v-if="drawnModels.length > 0">
            <div class="h-seperator" />
            <div class="modelList">
                <label
                    class="modelListLabel"
                    for="succesfully-imported-models"
                >
                    {{ $t("modules.tools.modeler3D.import.captions.successfullyImportedLabel") }}
                </label>
                <ul id="succesfully-imported-models">
                    <li
                        v-for="(model, index) in drawnModels"
                        :key="index"
                    >
                        <span class="index">
                            {{ index + 1 }}
                        </span>
                        <input
                            v-if="model.edit"
                            v-model="model.name"
                            class="inputName"
                            @blur="model.edit = false"
                            @keyup.enter="model.edit = false"
                        >
                        <span
                            v-else
                            role="button"
                            class="inputName"
                            tabindex="-1"
                            @click="model.edit = true"
                            @keyup.enter="model.edit = true"
                        >
                            {{ model.name }}
                        </span>
                        <div class="buttons">
                            <i
                                id="tool-import-view-zoomTo"
                                class="inline-button bi"
                                :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.zoomTo`, {name: model.name})"
                                @click="zoomTo(model.id)"
                                @keydown.enter="zoomTo(model.id)"
                                @mouseover="isHovering = `${index}-geo`"
                                @mouseout="isHovering = false"
                                @focusin="isHovering = `${index}-geo`"
                                @focusout="isHovering = false"
                            />
                            <i
                                id="tool-import-view-edit"
                                class="inline-button bi"
                                :class="{ 'bi-pencil-fill': isHovering === `${index}-edit`, 'bi-pencil': isHovering !== `${index}-edit`}"
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.editModel`, {name: model.name})"
                                @click="setCurrentModelId(model.id)"
                                @keydown.enter="setCurrentModelId(model.id)"
                                @mouseover="isHovering = `${index}-edit`"
                                @mouseout="isHovering = false"
                                @focusin="isHovering = `${index}-edit`"
                                @focusout="isHovering = false"
                            />
                            <i
                                v-if="model.show"
                                id="tool-import-view-show"
                                class="inline-button bi"
                                :class="{ 'bi-eye-slash-fill': isHovering === `${index}-hide`, 'bi-eye': isHovering !== `${index}-hide`}"
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: model.name})"
                                @click="changeVisibility(model)"
                                @keydown.enter="changeVisibility(model)"
                                @mouseover="isHovering = `${index}-hide`"
                                @mouseout="isHovering = false"
                                @focusin="isHovering = `${index}-hide`"
                                @focusout="isHovering = false"
                            />
                            <i
                                v-else
                                id="tool-import-view-hide"
                                class="inline-button bi"
                                :class="{ 'bi-eye-fill': isHovering === `${index}-show`, 'bi-eye-slash': isHovering !== `${index}-show`}"
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: model.name})"
                                @click="changeVisibility(model)"
                                @keydown.enter="changeVisibility(model)"
                                @mouseover="isHovering = `${index}-show`"
                                @mouseout="isHovering = false"
                                @focusin="isHovering = `${index}-show`"
                                @focusout="isHovering = false"
                            />
                            <i
                                id="tool-import-view-delete"
                                class="inline-button bi"
                                :class="{ 'bi-trash3-fill': isHovering === `${index}-del`, 'bi-trash3': isHovering !== `${index}-del`}"
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.deletionTitle`, {name: model.name})"
                                @click="confirmDeletion(model.id)"
                                @keydown.enter="confirmDeletion(model.id)"
                                @mouseover="isHovering = `${index}-del`"
                                @mouseout="isHovering = false"
                                @focusin="isHovering = `${index}-del`"
                                @focusout="isHovering = false"
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
</style>
