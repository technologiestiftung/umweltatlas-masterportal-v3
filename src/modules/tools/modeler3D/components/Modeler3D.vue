<script>
import ToolTemplate from "../../ToolTemplate.vue";
import EntityModelView from "./Modeler3DEntityModel.vue";
import ImportView from "./Modeler3DImport.vue";
import DrawView from "./Modeler3DDraw.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import store from "../../../../app-store";
import crs from "@masterportal/masterportalapi/src/crs";
import proj4 from "proj4";

let eventHandler = null;

export default {
    name: "Modeler3D",
    components: {
        ToolTemplate,
        EntityModelView,
        ImportView,
        DrawView
    },
    data () {
        return {
            defaultTabClass: "",
            activeTabClass: "active",
            isHovering: "",
            hideObjects: true,
            povActive: false,
            currentView: "import-view",
            currentCartesian: null,
            originalCursorStyle: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate"]),
        /**
         * Returns the CSS classes for the import tab based on the current view.
         * @returns {string} - The CSS classes for the import tab.
         */
        importTabClasses: function () {
            return this.currentView === "import-view" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the draw tab based on the current view.
         * @returns {string} - The CSS classes for the draw tab.
         */
        drawTabClasses: function () {
            return this.currentView === "draw-view" ? this.activeTabClass : this.defaultTabClass;
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
            const scene = this.scene,
                entities = this.entities,
                newEntity = entities.getById(newId),
                oldEntity = entities.getById(oldId);

            if (oldEntity) {
                oldEntity.model.color = Cesium.Color.WHITE;
                oldEntity.model.silhouetteColor = null;
                oldEntity.model.silhouetteSize = 0;
                oldEntity.model.colorBlendAmount = 0;
                scene.requestRender();

                this.setCurrentModelPosition(null);
            }
            if (newEntity) {
                this.highlightEntity(newEntity);
                this.setCurrentModelPosition(newEntity?.position?.getValue());
                this.setRotation(this.importedModels.find(model => model.id === this.currentModelId).heading);
                this.updatePositionUI();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

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
         * @returns {void}
         */
        moveEntity () {
            this.setIsDragging(true);

            eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            const scene = this.scene,
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

                if (entity) {
                    scene.requestRender();

                    this.setCurrentModelId(entity.id);
                }
                else if (this.hideObjects) {
                    const object = picked.pickId?.object;

                    if (object) {
                        object.show = false;

                        this.hiddenObjects.push({
                            id: object.featureId,
                            pickId: object.pickId.key,
                            layerId: object.tileset.layerReferenceId,
                            name: `Object ${object.featureId}`
                        });
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
                        entity.position = position;
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

            entity.model.color = Cesium.Color.fromAlpha(
                Cesium.Color.fromCssColorString(color),
                parseFloat(alpha)
            );
            entity.model.silhouetteColor =
                Cesium.Color.fromCssColorString(silhouetteColor);
            entity.model.silhouetteSize = parseFloat(silhouetteSize);
            entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
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
        changeSwitches () {
            this.hideObjects = !this.hideObjects;
            this.povActive = !this.povActive;
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
                <div v-if="!currentModelId">
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
                                @click.prevent="currentView = 'import-view'"
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
                                @click.prevent="currentView = 'draw-view'"
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
                                @click.prevent="currentView = ''"
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
                                    @change="changeSwitches()"
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
                                :disabled="!povPossible"
                                @click="positionPovCamera"
                            >
                                {{ povPossible ? $t("modules.tools.modeler3D.pov") : $t("modules.tools.modeler3D.buttonDisabledText") }}
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
                                @change="changeSwitches()"
                            >
                            <label
                                class="form-check-label"
                                for="hideObjectsSwitch"
                            >
                                {{ $t("modules.tools.modeler3D.hideSwitchLabel") }}
                            </label>
                        </div>
                    </div>
                    <template v-if="hiddenObjects.length > 0">
                        <div class="modelList">
                            <div class="h-seperator" />
                            <label
                                class="modelListLabel"
                                for="hidden-objects"
                            >
                                {{ $t("modules.tools.modeler3D.hiddenObjectsLabel") }}
                            </label>
                            <ul
                                id="hidden-objects"
                            >
                                <li
                                    v-for="(object, index) in hiddenObjects"
                                    :key="index"
                                    class="list-item"
                                >
                                    <span class="index">
                                        {{ index + 1 }}
                                    </span>
                                    <span
                                        class="inputName"
                                    >
                                        {{ object.name }}
                                    </span>
                                    <div class="buttons">
                                        <i
                                            class="inline-button bi"
                                            :class="{ 'bi-eye-fill': isHovering === `obj-${index}-show`, 'bi-eye-slash': isHovering !== `obj-${index}-show`}"
                                            :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
                                            @click="showObject(object)"
                                            @keydown.enter="showObject(object)"
                                            @mouseover="isHovering = `obj-${index}-show`"
                                            @mouseout="isHovering = false"
                                            @focusin="isHovering = `obj-${index}-show`"
                                            @focusout="isHovering = false"
                                        />
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
                <EntityModelView
                    v-else
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    input[type="file"] {
        display: none;
    }
    input[type="button"] {
        display: none;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .cta {
        margin-bottom:12px;
    }

    .form-switch {
        font-size: $font_size_big;
    }

    .drop-area-fake {
        background-color: $white;
        border-radius: 12px;
        border: 2px dashed $accent;
        padding:24px;
        transition: background 0.25s, border-color 0.25s;

        &.dzReady {
            background-color:$accent_hover;
            border-color:transparent;

            p.caption {
                color: $white;
            }
        }

        p.caption {
            margin:0;
            text-align:center;
            transition: color 0.35s;
            font-family: $font_family_accent;
            font-size: $font-size-lg;
            color: $accent;
        }
    }

    .drop-area {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:10;
    }

    .vh-center-outer-wrapper {
        top:0;
        left:0;
        right:0;
        bottom:0;
        text-align:center;
        position:relative;

        &:before {
            content:'';
            display:inline-block;
            height:100%;
            vertical-align:middle;
            margin-right:-0.25em;
        }
    }
    .vh-center-inner-wrapper {
        text-align:left;
        display:inline-block;
        vertical-align:middle;
        position:relative;
    }

    .modelListLabel {
        font-weight: bold;
    }

    .modelList {
        font-size: $font_size_icon_lg;
    }

    .index {
        width: 15%;
    }

    .inputName {
        width: 60%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .buttons {
        margin-left: auto;
    }

    .inline-button {
        cursor: pointer;
        display: inline-block;
        &:focus {
            transform: translateY(-2px);
        }
        &:hover {
            transform: translateY(-2px);
        }
        &:active {
            transform: scale(0.98);
        }
    }

    .position-control {
        display: flex;
        gap: 0.25em;
    }

    .btn-margin {
        margin-top: 1em;
    }

    .btn-pos {
        padding: 0.25em;
    }

    .btn-primary {
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
        &:active {
            transform: scale(0.98);
        }
    }

    #hidden-objects {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    .list-item {
        display: flex;
        align-items: center;
        height: 1.5rem;
    }

    .row {
        align-items: center;
    }

    .nav-tabs {
        margin-bottom: 1em;
    }
</style>
