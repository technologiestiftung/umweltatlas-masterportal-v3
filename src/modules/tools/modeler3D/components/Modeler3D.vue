<script>
import ToolTemplate from "../../ToolTemplate.vue";
import EntityModel from "./Modeler3DEntityModel.vue";
import Import from "./Modeler3DImport.vue";
import Draw from "./Modeler3DDraw.vue";
import EntityList from "./ui/EntityList.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import store from "../../../../app-store";
import crs from "@masterportal/masterportalapi/src/crs";
import proj4 from "proj4";
import {getGfiFeaturesByTileFeature} from "../../../../api/gfi/getGfiFeaturesByTileFeature";
import {adaptCylinderToGround, adaptCylinderToPolygon} from "./utils/draw";

let eventHandler = null;

export default {
    name: "Modeler3D",
    components: {
        ToolTemplate,
        EntityModel,
        Import,
        Draw,
        EntityList
    },
    data () {
        return {
            defaultTabClass: "",
            currentPosition: null,
            activeTabClass: "active",
            isHovering: "",
            povActive: false,
            currentCartesian: null,
            originalCursorStyle: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"]),
        /**
         * Returns the CSS classes for the import tab based on the current view.
         * @returns {string} - The CSS classes for the import tab.
         */
        importTabClasses: function () {
            return this.currentView === "import" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the draw tab based on the current view.
         * @returns {string} - The CSS classes for the draw tab.
         */
        drawTabClasses: function () {
            return this.currentView === "draw" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the options tab based on the current view.
         * @returns {string} - The CSS classes for the options tab.
         */
        optionsTabClasses: function () {
            return this.currentView === "" ? this.activeTabClass : this.defaultTabClass;
        },
        // longitude und latitude getter der Map wurden gedreht, Bug in MasterportalApi!
        longitudeFromClick: function () {
            return this.longitude && this.povActive ? this.latitude.toFixed(4) : "";
        },
        latitudeFromClick: function () {
            return this.latitude && this.povActive ? this.longitude.toFixed(4) : "";
        },
        altitudeFromClick: function () {
            return this.altitude && this.povActive ? this.altitude.toFixed(2) : "";
        },
        povPossible: function () {
            return this.longitude && this.latitude && this.altitude;
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                const scene = this.scene;

                this.initProjections();
                eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

                eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
            else {
                eventHandler.destroy();
            }
        },
        /**
         * Updates the current model ID and performs corresponding actions.
         * @param {string} newId - The ID of the new model.
         * @param {string} oldId - The ID of the old model.
         * @returns {void}
         */
        currentModelId (newId, oldId) {
            if (!this.isDrawing) {
                const scene = this.scene,
                    entities = this.entities,
                    newEntity = entities.getById(newId),
                    oldEntity = entities.getById(oldId);

                if (oldEntity) {
                    if (oldEntity.wasDrawn) {
                        oldEntity.polygon.material.color = oldEntity.originalColor;
                        oldEntity.polygon.outline = false;
                        oldEntity.polygon.outlineColor = null;
                        oldEntity.polygon.outlineWidth = null;
                        oldEntity.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));
                        this.removeCylinders();
                        this.setActiveShapePoints([]);
                        this.setCylinderId(null);
                        this.setExtrudedHeight(20);
                    }
                    else {
                        oldEntity.model.color = Cesium.Color.WHITE;
                        oldEntity.model.silhouetteColor = null;
                        oldEntity.model.silhouetteSize = 0;
                        oldEntity.model.colorBlendAmount = 0;
                    }
                    scene.requestRender();

                    this.setCurrentModelPosition(null);
                }
                if (newEntity) {
                    if (newEntity.wasDrawn) {
                        this.generateCylinders();
                        this.setActiveShapePoints(newEntity.polygon.hierarchy.getValue().positions);
                        newEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.activeShapePoints), false);
                    }
                    this.highlightEntity(newEntity);
                    this.setCurrentModelPosition(newEntity?.position?.getValue() || this.getCenterFromPolygon(newEntity));
                    this.updateUI();
                }
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),

        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjections () {
            const pr = crs.getProjections(),
                epsg8395 = [],
                wgs84Proj = [];

            if (this.projections.length) {
                return;
            }
            // id is set to the name and in case of decimal "-DG" is appended to name later on
            // for use in select-box
            pr.forEach(proj => {
                proj.id = proj.name;
                if (proj.name === "EPSG:4326" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#4326") {
                    wgs84Proj.push(proj);
                }
                if (proj.name === "EPSG:8395" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#8395") {
                    epsg8395.push(proj);
                }
                if (proj.name.indexOf("#") > -1) { // e.g. "http://www.opengis.net/gml/srs/epsg.xml#25832"
                    const code = proj.name.substring(proj.name.indexOf("#") + 1, proj.name.length);

                    proj.epsg = "EPSG:" + code;
                }
                else {
                    proj.title = proj.name;
                }
                if (proj.id === this.currentProjection.id) {
                    this.setCurrentProjection(proj);
                }
            });
            if (wgs84Proj.length > 0) {
                this.addWGS84Decimal(pr, wgs84Proj);
            }
            this.namedProjections.find((el) => {
                if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                    this.addETRS893GK3(pr, el, epsg8395);
                    return true;
                }
                return false;
            });
            this.setProjections(pr);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} elementETRS89_3GK3 the WGS84 projection contained in list of projections
         * @param {Object} epsg8395 the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addETRS893GK3 (projections, elementETRS89_3GK3, epsg8395) {
            const index = projections.findIndex(proj => proj.name === "EPSG:8395"),
                etrs89_3GK3Proj = {};

            for (const key in epsg8395[0]) {
                etrs89_3GK3Proj[key] = epsg8395[0][key];
            }
            etrs89_3GK3Proj.name = "ETRS893GK3";
            etrs89_3GK3Proj.epsg = "EPSG:8395";
            etrs89_3GK3Proj.id = "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3";
            etrs89_3GK3Proj.title = elementETRS89_3GK3[1].substring(elementETRS89_3GK3[1].lastIndexOf("ETRS"), elementETRS89_3GK3[1].indexOf(" +proj="));
            etrs89_3GK3Proj.getCode = () => "noEPSGCode";
            projections.splice(index + 1, 0, etrs89_3GK3Proj);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} wgs84Proj the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addWGS84Decimal (projections, wgs84Proj) {
            const index = projections.findIndex(proj => proj.name === "EPSG:4326"),
                wgs84ProjDez = {};

            for (const key in wgs84Proj[0]) {
                wgs84ProjDez[key] = wgs84Proj[0][key];
            }
            wgs84ProjDez.name = "EPSG:4326-DG";
            wgs84ProjDez.epsg = "EPSG:4326";
            wgs84ProjDez.id = "http://www.opengis.net/gml/srs/epsg.xml#4326-DG";
            wgs84ProjDez.title = "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326";
            wgs84ProjDez.getCode = () => "EPSG:4326-DG";
            projections.splice(index + 1, 0, wgs84ProjDez);
        },
        /**
         * Initiates the process of moving an entity.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveEntity (event) {
            let entity;

            if (event) {
                const scene = this.scene,
                    picked = scene.pick(event.position);

                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);
            }

            if (entity instanceof Cesium.Entity || !event) {
                this.setIsDragging(true);
                this.originalHideOption = this.hideObjects;
                this.setHideObjects(false);

                if (entity?.cylinder) {
                    const polygon = this.entities.getById(this.currentModelId);

                    this.currentPosition = polygon.polygon.hierarchy.getValue().positions[entity.positionIndex];

                    entity.position = polygon.clampToGround ?
                        new Cesium.CallbackProperty(() => adaptCylinderToGround(entity, this.currentPosition), false) :
                        new Cesium.CallbackProperty(() => adaptCylinderToPolygon(polygon, entity, this.currentPosition), false);
                    eventHandler.setInputAction(this.moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                else {
                    eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            if (!this.isDrawing) {
                const scene = this.scene,
                    picked = scene.pick(event.position);

                if (Cesium.defined(picked)) {
                    const entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

                    if (entity instanceof Cesium.Entity) {
                        if (entity.cylinder) {
                            this.setCylinderId(entity.id);
                        }
                        else {
                            this.setCurrentModelId(entity.id);
                            this.setCylinderId(null);
                        }
                    }
                    else if (this.hideObjects && picked instanceof Cesium.Cesium3DTileFeature) {
                        const features = getGfiFeaturesByTileFeature(picked),
                            gmlId = features[0]?.getProperties().gmlid,
                            object = picked.pickId?.object;

                        if (object) {
                            object.show = false;

                            this.hiddenObjects.push({
                                id: object.featureId,
                                pickId: object.pickId.key,
                                layerId: object.tileset.layerReferenceId,
                                name: gmlId || "Hidden object " + this.id
                            });
                        }
                    }
                }
            }
        },
        moveCylinder (event) {
            if (this.isDragging) {
                const entities = this.entities,
                    polygon = entities.getById(this.currentModelId),
                    cylinder = entities.getById(this.cylinderId),
                    scene = this.scene;

                if (Cesium.defined(cylinder) && Cesium.defined(polygon)) {
                    if (polygon.clampToGround) {
                        const ray = scene.camera.getPickRay(event.endPosition),
                            position = scene.globe.pick(ray, scene);

                        if (this.currentPosition !== position) {
                            this.currentPosition = scene.globe.pick(ray, scene);
                        }
                    }
                    else {
                        const transformedCoordinates = proj4(proj4("EPSG:25832"), proj4("EPSG:4326"), [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                            cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

                        cartographic.height = scene.sampleHeight(cartographic, [cylinder, polygon]);

                        if (this.currentPosition !== Cesium.Cartographic.toCartesian(cartographic)) {
                            this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
                        }
                    }
                    if (Cesium.defined(this.currentPosition)) {
                        this.activeShapePoints.splice(cylinder.positionIndex, 1, this.currentPosition);
                    }
                }
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging an object.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        onMouseMove (event) {
            if (this.isDragging) {
                const scene = this.scene,
                    ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                if (Cesium.defined(position)) {
                    const entities = this.entities,
                        entity = entities.getById(this.currentModelId);

                    if (Cesium.defined(entity)) {
                        if (entity.polygon) {
                            entities.values.filter(ent => ent.cylinder).forEach((cyl, index) => {
                                cyl.position = entity.clampToGround ?
                                    new Cesium.CallbackProperty(() => adaptCylinderToGround(cyl, this.cylinderPosition[index]), false) :
                                    new Cesium.CallbackProperty(() => adaptCylinderToPolygon(entity, cyl, this.cylinderPosition[index]), false);
                            });
                            this.movePolygon({entity: entity, position: position});
                        }
                        else if (entity.position !== position) {
                            entity.position = position;
                        }
                        this.updatePositionUI();
                    }
                }
            }
        },
        /**
         * Handles the mouse up event and performs actions when the dragging of an object is finished.
         * @returns {void}
         */
        onMouseUp () {
            if (this.isDragging) {
                this.removeInputActions();
                this.setIsDragging(false);

                if (this.cylinderId) {
                    const cylinder = this.entities.getById(this.cylinderId),
                        polygon = this.entities.getById(this.currentModelId);

                    cylinder.position = polygon?.clampToGround ?
                        adaptCylinderToGround(cylinder) :
                        adaptCylinderToPolygon(polygon, cylinder);
                    this.setCylinderId(null);
                }
                else if (this.wasDrawn) {
                    const cylinders = this.entities.values.filter(ent => ent.cylinder),
                        polygon = this.entities.getById(this.currentModelId);

                    cylinders.forEach((cyl) => {
                        cyl.position = polygon?.clampToGround ?
                            adaptCylinderToGround(cyl) :
                            adaptCylinderToPolygon(polygon, cyl);
                    });
                }
                this.setHideObjects(this.originalHideOption);
            }
        },
        /**
         * Removes the input actions related to mouse move and left double click events.
         * @returns {void}
         */
        removeInputActions () {
            if (eventHandler) {
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },
        /**
         * Highlights the specified entity by applying the configured or default highlight style.
         * @param {Cesium.Entity} entity - The entity to highlight.
         * @returns {void}
         */
        highlightEntity (entity) {
            const configuredHighlightStyle = store.state.configJson?.Portalconfig.menu.tools.children.modeler3D.highlightStyle,
                color = configuredHighlightStyle?.color || this.highlightStyle.color,
                alpha = configuredHighlightStyle?.alpha || this.highlightStyle.alpha,
                silhouetteColor = configuredHighlightStyle?.silhouetteColor || this.highlightStyle.silhouetteColor,
                silhouetteSize = configuredHighlightStyle?.silhouetteSize || this.highlightStyle.silhouetteSize;

            if (entity.wasDrawn) {
                entity.originalColor = entity.polygon.material.color;
                entity.polygon.material.color = Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(color),
                    parseFloat(alpha)
                );
                entity.polygon.outline = true;
                entity.polygon.outlineColor = Cesium.Color.fromCssColorString(silhouetteColor);
            }
            else {
                entity.model.color = Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(color),
                    parseFloat(alpha)
                );
                entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
                entity.model.silhouetteSize = parseFloat(silhouetteSize);
                entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
            }
        },
        /**
         * Shows the specified object by making it visible in the scene.
         * @param {Object} object - The object to show.
         * @returns {void}
         */
        showObject (object) {
            const scene = this.scene,
                primitives = scene.primitives,
                tileset = primitives._primitives.find(x => x.layerReferenceId === object.layerId),
                visibleTiles = tileset._selectedTiles,
                objectIndex = this.hiddenObjects.findIndex(x => x.id === object.id);

            for (let i = 0; i < visibleTiles.length; i++) {
                const content = visibleTiles[i].content,
                    feature = content.getFeature(object.id);

                if (feature?.pickId?.key === object.pickId) {
                    feature.show = true;
                    this.hiddenObjects.splice(objectIndex, 1);
                    break;
                }
            }
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Positions the camera in the point of view of a pedestrian at the clicked position.
         * @returns {void}
         */
        positionPovCamera () {
            const scene = this.scene,
                transformedCoordinates = proj4(proj4("EPSG:25832"), proj4("EPSG:4326"), this.clickCoordinate),
                currentPosition = scene.camera.positionCartographic,
                destination = new Cesium.Cartographic(
                    Cesium.Math.toRadians(transformedCoordinates[0]),
                    Cesium.Math.toRadians(transformedCoordinates[1])
                );

            this.originalCursorStyle = document.body.style.cursor;
            this.currentCartesian = Cesium.Cartographic.toCartesian(currentPosition);
            destination.height = this.altitude + 1.80;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height),
                orientation: {
                    pitch: 0,
                    roll: 0,
                    heading: scene.camera.heading
                },
                complete: () => {
                    document.body.style.cursor = "none";
                }
            });
            eventHandler.setInputAction((movement) => {
                const deltaY = -movement.endPosition.y + movement.startPosition.y,
                    deltaX = movement.endPosition.x - movement.startPosition.x,

                    sensitivity = 0.005,
                    pitch = Cesium.Math.clamp(scene.camera.pitch + sensitivity * deltaY, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI_OVER_TWO),
                    heading = scene.camera.heading + sensitivity * deltaX;

                scene.camera.setView({
                    orientation: {
                        pitch: pitch,
                        roll: 0,
                        heading: heading
                    }
                });
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            scene.screenSpaceCameraController.enableZoom = false;
            scene.screenSpaceCameraController.enableRotate = false;
            document.addEventListener("keydown", this.escapeKeyHandler);
        },
        /**
         * Handles the Escape key press to reset the camera perspective.
         * @param {KeyboardEvent} e - The event object for the keyboard event.
         * @returns {void}
         */
        escapeKeyHandler (e) {
            const scene = this.scene;

            if (e.code === "Escape") {
                scene.camera.flyTo({
                    destination: this.currentCartesian,
                    complete: () => {
                        scene.screenSpaceCameraController.enableZoom = true;
                        scene.screenSpaceCameraController.enableRotate = true;

                        eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        document.removeEventListener("keydown", this.escapeKeyHandler);
                        document.body.style.cursor = this.originalCursorStyle;
                    }
                });
            }
        },
        changeSwitches (id) {
            if (id === "povActiveSwitch" || this.povActive) {
                this.povActive = !this.povActive;
            }
            this.setHideObjects(!this.hideObjects);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="380"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-modeler3D"
            >
                <EntityModel
                    v-if="currentModelId"
                />
                <div v-else>
                    <ul class="nav nav-tabs">
                        <li
                            id="tool-modeler3D-import"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="importTabClasses"
                                @click.prevent="setCurrentView('import')"
                            >{{ $t("modules.tools.modeler3D.nav.importTitle") }}</a>
                        </li>
                        <li
                            id="tool-modeler3D-draw"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="drawTabClasses"
                                @click.prevent="setCurrentView('draw')"
                            >{{ $t("modules.tools.modeler3D.nav.drawTitle") }}</a>
                        </li>
                        <li
                            id="tool-modeler3D-options"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="optionsTabClasses"
                                @click.prevent="setCurrentView('')"
                            >{{ $t("modules.tools.modeler3D.nav.options") }}</a>
                        </li>
                    </ul>
                    <component
                        :is="currentView"
                        v-if="currentView"
                        @emit-move="moveEntity"
                    />
                    <div
                        v-if="!currentView"
                        id="modeler3D-options-view"
                    >
                        <div>
                            <div class="form-check form-switch cta">
                                <input
                                    id="povActiveSwitch"
                                    class="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    :aria-checked="povActive"
                                    :checked="povActive"
                                    @change="changeSwitches('povActiveSwitch')"
                                >
                                <label
                                    class="form-check-label"
                                    for="povActiveSwitch"
                                >
                                    {{ $t("modules.tools.modeler3D.activatePov") }}
                                </label>
                            </div>
                            <p
                                class="cta"
                                v-html="$t('modules.tools.modeler3D.entity.captions.povInfo')"
                            />
                            <div>
                                <input
                                    v-model="longitudeFromClick"
                                    aria-label="longitude"
                                    type="text"
                                    readonly
                                    :placeholder="$t('modules.tools.modeler3D.entity.projections.hdms.eastingLabel')"
                                >
                                <input
                                    v-model="latitudeFromClick"
                                    aria-label="latitude"
                                    type="text"
                                    readonly
                                    :placeholder="$t('modules.tools.modeler3D.entity.projections.hdms.northingLabel')"
                                >
                                <input
                                    v-model="altitudeFromClick"
                                    aria-label="altitude"
                                    type="text"
                                    readonly
                                    :placeholder="$t('modules.tools.modeler3D.entity.projections.height')"
                                >
                            </div>
                            <button
                                class="col-10 btn btn-primary btn-sm primary-button-wrapper"
                                :disabled="!povActive || !povPossible"
                                @click="positionPovCamera"
                            >
                                {{ povActive && povPossible ? $t("modules.tools.modeler3D.pov") : $t("modules.tools.modeler3D.buttonDisabledText") }}
                            </button>
                        </div><hr>
                        <div class="form-check form-switch cta">
                            <input
                                id="hideObjectsSwitch"
                                class="form-check-input"
                                type="checkbox"
                                role="switch"
                                :aria-checked="hideObjects"
                                :checked="hideObjects"
                                @change="changeSwitches('hideObjectsSwitch')"
                            >
                            <label
                                class="form-check-label"
                                for="hideObjectsSwitch"
                            >
                                {{ $t("modules.tools.modeler3D.hideSwitchLabel") }}
                            </label>
                        </div>
                    </div>
                    <EntityList
                        v-if="hiddenObjects.length > 0 && !isLoading"
                        id="hidden-objects"
                        :objects="hiddenObjects"
                        :objects-label="$t('modules.tools.modeler3D.hiddenObjectsLabel')"
                        @change-visibility="showObject"
                    />
                </div>
            </div>
        </template>
    </ToolTemplate>
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

    .nav-tabs {
        margin-bottom: 1em;
    }
</style>
