<script>
import ToolTemplate from "../../ToolTemplate.vue";
import ImportModelView from "./ImportModelView.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsImport3D";
import getters from "../store/gettersImport3D";
import mutations from "../store/mutationsImport3D";
import store from "../../../../app-store";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import crs from "@masterportal/masterportalapi/src/crs";

export default {
    name: "Import3D",
    components: {
        ToolTemplate,
        ImportModelView
    },
    data () {
        return {
            isHovering: false,
            dzIsDropHovering: false,
            isDragging: false,
            storePath: this.$store.state.Tools.Import3D,
            eventHandler: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Import3D", Object.keys(getters)),

        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        },

        console: () => console
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
                this.setFocusToFirstControl();
                this.eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                this.eventHandler.setInputAction(this.selectEntity, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
            else {
                this.eventHandler.destroy();
            }
        },
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
                this.isHovering = false;
                this.updatePositionUI();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/Import3D", Object.keys(actions)),
        ...mapMutations("Tools/Import3D", Object.keys(mutations)),

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
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["upload-label"]) {
                    this.$refs["upload-label"].focus();
                }
            });
        },
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        onDZMouseenter () {
            this.dzIsHovering = true;
        },
        onDZMouseleave () {
            this.dzIsHovering = false;
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
            }
            this.$refs["upload-input-file"].value = "";
        },
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        onMouseMove (event) {
            if (this.isDragging) {
                const scene = this.scene,
                    ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                // heading = Cesium.Math.toRadians(parseInt(this.rotationAngle, 10)),
                // hpr = new Cesium.HeadingPitchRoll(heading, 0.0, 0.0); // Heading: 0 Grad, Pitch: 0 Grad, Roll: 0 Grad;

                if (Cesium.defined(position)) {
                    const entities = this.entities,
                        entity = entities.getById(this.currentModelId);

                    if (Cesium.defined(entity)) {
                        entity.position = position;
                        this.updatePositionUI();
                        // entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
                    }
                }
            }
        },
        onMouseUp () {
            if (this.isDragging) {
                this.removeInputActions();
                this.isDragging = false;
            }
        },
        moveEntity () {
            this.isDragging = true;

            this.eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
        },
        selectEntity (event) {
            const scene = this.scene,
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked.id, picked.primitive.id);

                if (entity) {
                    scene.requestRender();

                    this.setCurrentModelId(entity.id);
                }
            }
            return undefined;
        },
        highlightEntity (entity) {
            const configuredHighlightStyle = store.state.configJson.Portalconfig.menu.tools.children.import3D.highlightStyle,
                color = configuredHighlightStyle?.color || this.highlightStyle.color,
                alpha = configuredHighlightStyle?.alpha || this.highlightStyle.alpha,
                silhouetteColor = configuredHighlightStyle?.silhouetteColor || this.highlightStyle.silhouetteColor,
                silhouetteSize = configuredHighlightStyle?.silhouetteSize || this.highlightStyle.silhouetteSize;

            entity.model.color = Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString(color), parseFloat(alpha));
            entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
            entity.model.silhouetteSize = parseFloat(silhouetteSize);
            entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
        },
        removeInputActions () {
            if (this.eventHandler) {
                this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_UP);
            }
        },
        addFile (files) {
            const reader = new FileReader(),
                file = files[0],
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop(),
                fileSizeMB = file.size / (1024 * 1024),
                maxFileSizeMB = 100;

            if (fileSizeMB > maxFileSizeMB) {
                store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.import3D.alertingMessages.fileSizeError"), {root: true});
                return;
            }

            this.isDragging = true;

            reader.onload = () => {
                if (fileExtension === "gltf") {
                    this.handleGltfFile(file, fileName);
                }
                else if (fileExtension === "obj") {
                    this.handleObjFile(file, fileName);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(file, fileName);
                }
                else {
                    console.error(fileExtension + " files are currently not supported!");
                }
            };

            reader.onerror = (e) => {
                console.error("Fehler beim Lesen der Datei:", e.target.error);
            };

            if (fileExtension === "gltf") {
                reader.readAsArrayBuffer(file);
            }
            else {
                reader.readAsText(file);
            }
        },
        handleGltfFile (file, fileName) {
            const entities = this.entities,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                models = this.importedModels,
                entity = {
                    id: lastId ? lastId + 1 : 1,
                    name: fileName,
                    model: {
                        uri: URL.createObjectURL(file)
                    }
                };

            this.setCurrentModelId(entity.id);

            this.eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);

            entities.add(entity);

            models.push({
                id: entity.id,
                name: fileName,
                show: true,
                heading: 0,
                edit: false
            });
            this.setImportedModels(models);
        },
        handleObjFile (file, fileName) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const objText = event.target.result,
                    objLoader = new OBJLoader(),
                    objData = objLoader.parse(objText),
                    gltfExporter = new GLTFExporter();

                gltfExporter.parse(objData, (gltfData) => {
                    const gltfJson = JSON.stringify(gltfData),
                        blob = new Blob([gltfJson], {type: "model/gltf+json"});

                    this.handleGltfFile(blob, fileName);
                });
            };
            reader.readAsText(file);
        },
        handleDaeFile (file, fileName) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const daeText = event.target.result,
                    colladaLoader = new ColladaLoader();

                colladaLoader.load(daeText, (collada) => {
                    const exporter = new GLTFExporter();

                    exporter.parse(collada.scene, (gltfData) => {
                        const gltfLoader = new GLTFLoader();

                        gltfLoader.parse(gltfData, "", () => {
                            const gltfJson = JSON.stringify(gltfData),
                                blob = new Blob([gltfJson], {type: "model/gltf+json"});

                            this.handleGltfFile(blob, fileName);
                        });
                    });
                });
            };
            reader.readAsDataURL(file);
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        changeVisibility (model) {
            const entities = this.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        zoomTo (id) {
            const scene = this.scene,
                entities = this.entities,
                entity = entities.getById(id),
                entityPosition = entity.position.getValue(),
                currentPosition = scene.camera.positionCartographic,
                destination = Cesium.Cartographic.fromCartesian(entityPosition);

            destination.height = currentPosition.height;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height)
            });
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
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
                id="tool-import3d"
            >
                <div v-if="!currentModelId">
                    <p
                        class="cta"
                        v-html="$t('modules.tools.import3D.captions.introInfo')"
                    />
                    <p
                        class="cta"
                        v-html="$t('modules.tools.import3D.captions.introFormats')"
                    />
                    <div
                        class="vh-center-outer-wrapper drop-area-fake"
                        :class="dropZoneAdditionalClass"
                    >
                        <div
                            class="vh-center-inner-wrapper"
                        >
                            <p
                                class="caption"
                            >
                                {{ $t("modules.tools.import3D.captions.dropzone") }}
                            </p>
                        </div>

                        <!-- eslint-disable-next-line vuejs-accessibility/mouse-events-have-key-events -->
                        <div
                            class="drop-area"
                            @drop.prevent="onDrop"
                            @dragover.prevent
                            @dragenter.prevent="onDZDragenter"
                            @dragleave="onDZDragend"
                            @mouseenter="onDZMouseenter"
                            @mouseleave="onDZMouseleave"
                        />
                        <!--
                            The previous element does not provide a @focusin or @focus reaction as would
                            be considered correct by the linting rule set. Since it's a drop-area for file
                            dropping by mouse, the concept does not apply. Keyboard users may use the
                            matching input fields.
                        -->
                    </div>

                    <div>
                        <label
                            ref="upload-label"
                            class="primary-button-wrapper"
                            tabindex="0"
                            @keydown="triggerClickOnFileInput"
                        >
                            <input
                                ref="upload-input-file"
                                type="file"
                                @change="onInputChange"
                            >
                            {{ $t("modules.tools.import3D.captions.browse") }}
                        </label>
                    </div>

                    <div v-if="importedModels.length > 0">
                        <div class="h-seperator" />
                        <p class="cta">
                            <label
                                class="successfullyImportedLabel"
                                for="succesfully-imported-models"
                            >
                                {{ $t("modules.tools.import3D.successfullyImportedLabel") }}
                            </label>
                            <ul id="succesfully-imported-models">
                                <li
                                    v-for="(model, index) in importedModels"
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
                                            class="inline-button bi"
                                            :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                                            :title="$t(`common:modules.tools.import3D.zoomTo`, {name: model.name})"
                                            @click="zoomTo(model.id)"
                                            @keydown.enter="zoomTo(model.id)"
                                            @mouseover="isHovering = `${index}-geo`"
                                            @mouseout="isHovering = false"
                                            @focusin="isHovering = `${index}-geo`"
                                            @focusout="isHovering = false"
                                        />
                                        <i
                                            class="inline-button bi"
                                            :class="{ 'bi-pencil-fill': isHovering === `${index}-edit`, 'bi-pencil': isHovering !== `${index}-edit`}"
                                            :title="$t(`common:modules.tools.import3D.editModel`, {name: model.name})"
                                            @click="setCurrentModelId(model.id)"
                                            @keydown.enter="setCurrentModelId(model.id)"
                                            @mouseover="isHovering = `${index}-edit`"
                                            @mouseout="isHovering = false"
                                            @focusin="isHovering = `${index}-edit`"
                                            @focusout="isHovering = false"
                                        />
                                        <i
                                            v-if="model.show"
                                            class="inline-button bi"
                                            :class="{ 'bi-eye-slash-fill': isHovering === `${index}-hide`, 'bi-eye': isHovering !== `${index}-hide`}"
                                            :title="$t(`common:modules.tools.import3D.visibilityTitle`, {name: model.name})"
                                            @click="changeVisibility(model)"
                                            @keydown.enter="changeVisibility(model)"
                                            @mouseover="isHovering = `${index}-hide`"
                                            @mouseout="isHovering = false"
                                            @focusin="isHovering = `${index}-hide`"
                                            @focusout="isHovering = false"
                                        />
                                        <i
                                            v-else
                                            class="inline-button bi"
                                            :class="{ 'bi-eye-fill': isHovering === `${index}-show`, 'bi-eye-slash': isHovering !== `${index}-show`}"
                                            :title="$t(`common:modules.tools.import3D.visibilityTitle`, {name: model.name})"
                                            @click="changeVisibility(model)"
                                            @keydown.enter="changeVisibility(model)"
                                            @mouseover="isHovering = `${index}-show`"
                                            @mouseout="isHovering = false"
                                            @focusin="isHovering = `${index}-show`"
                                            @focusout="isHovering = false"
                                        />
                                        <i
                                            class="inline-button bi"
                                            :class="{ 'bi-trash3-fill': isHovering === `${index}-del`, 'bi-trash3': isHovering !== `${index}-del`}"
                                            :title="$t(`common:modules.tools.import3D.deletionTitle`, {name: model.name})"
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
                        </p>
                    </div>
                </div>
                <ImportModelView
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

    .red {
        color: red;
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

    .successfullyImportedLabel {
        font-weight: bold;
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

    .position-input {
        height: 3.8em;
    }

    .check-height {
        width: 1.5em;
        height: 1.5em;

        margin: 0;
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

    .row {
        align-items: center;
    }

    ul {
        font-size: $font_size_icon_lg;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: flex;
        align-items: center;
        height: 1.5rem;
    }
</style>
