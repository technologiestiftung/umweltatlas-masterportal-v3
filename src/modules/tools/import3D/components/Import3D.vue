<script>
import ToolTemplate from "../../ToolTemplate.vue";
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
        ToolTemplate
    },
    data () {
        return {
            isHovering: false,
            dzIsDropHovering: false,
            isDragging: false,
            storePath: this.$store.state.Tools.Import3D,
            eventHandler: null,
            rotationAngle: 0,
            rotationClickValue: 5,
            rotationDropdownValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
                const scene = mapCollection.getMap("3D").getCesiumScene();

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
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
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
         * Called if selection of projection changed. Sets the current projection to state and updates the UI.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            if (event.target.value) {
                this.newProjectionSelected(event.target.value);
            }
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
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                // heading = Cesium.Math.toRadians(parseInt(this.rotationAngle, 10)),
                // hpr = new Cesium.HeadingPitchRoll(heading, 0.0, 0.0); // Heading: 0 Grad, Pitch: 0 Grad, Roll: 0 Grad;

                if (Cesium.defined(position)) {
                    const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
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
        rotate () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                heading = Cesium.Math.toRadians(parseInt(this.rotationAngle, 10)),
                modelFromState = this.importedModels.find(model => model.id === this.currentModelId),
                orientationMatrix = Cesium.Transforms.headingPitchRollQuaternion(
                    entity.position.getValue(),
                    new Cesium.HeadingPitchRoll(heading, 0, 0)
                );

            modelFromState.heading = parseInt(this.rotationAngle, 10);
            entity.orientation = orientationMatrix;
        },
        decrementAngle () {
            const newRotationAngle = parseInt(this.rotationAngle, 10) - parseInt(this.rotationClickValue, 10);

            this.rotationAngle = Math.max(newRotationAngle, -180);
            this.rotate();
        },
        incrementAngle () {
            const newRotationAngle = parseInt(this.rotationAngle, 10) + parseInt(this.rotationClickValue, 10);

            this.rotationAngle = Math.min(newRotationAngle, 180);
            this.rotate();
        },
        selectEntity (event) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked.id, picked.primitive.id);

                if (entity) {
                    scene.requestRender();

                    this.setCurrentModelId(entity.id);
                    this.rotationAngle = this.importedModels.find(model => model.id === this.currentModelId).heading;
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
            entity.model.silhouetteSize = silhouetteSize;
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
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                models = this.importedModels,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                alertingMessage = i18next.t("common:modules.tools.import3D.alertingMessages.formatConversion", {format: fileExtension, file: fileName});

            this.isDragging = true;

            if (fileExtension === "gltf") {
                reader.onload = () => {
                    const entity = {
                        id: lastId ? lastId + 1 : 1,
                        name: file.name,
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
                        name: file.name,
                        show: true,
                        heading: 0
                    });

                    this.setImportedModels(models);
                };
                reader.onerror = (e) => {
                    console.error("Fehler beim Lesen der Datei:", e.target.error);
                };
                reader.readAsArrayBuffer(file);
            }
            else if (fileExtension === "obj") {
                reader.onload = (event) => {
                    const objText = event.target.result,
                        objLoader = new OBJLoader(),
                        objData = objLoader.parse(objText),

                        gltfExporter = new GLTFExporter();

                    gltfExporter.parse(objData, (gltfData) => {
                        this.downloadConvertedObject(fileName, gltfData);
                        store.dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
                    });
                };
                reader.readAsText(file);
            }
            else if (fileExtension === "dae") {
                reader.onload = (event) => {
                    const daeText = event.target.result,
                        colladaLoader = new ColladaLoader();

                    colladaLoader.load(daeText, (collada) => {
                        const exporter = new GLTFExporter();

                        exporter.parse(collada.scene, (gltfData) => {
                            const gltfLoader = new GLTFLoader();

                            gltfLoader.parse(gltfData, "", () => {
                                this.downloadConvertedObject(fileName, gltfData);
                                store.dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
                            });
                        });
                    });
                };
                reader.readAsDataURL(file);
            }
            else {
                console.error(fileExtension + " files are currently not supported!");
            }
        },
        downloadConvertedObject (fileName, file) {
            const gltfJson = JSON.stringify(file),
                blob = new Blob([gltfJson], {type: "model/gltf+json"}),
                url = URL.createObjectURL(blob),
                link = document.createElement("a");

            link.href = url;
            link.download = fileName + ".gltf";
            document.body.appendChild(link);
            link.click();

            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        changeVisibility (model) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        zoomTo (id) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
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
                                    <span>
                                        {{ index + 1 }}
                                    </span>
                                    <span>
                                        {{ model.name }}
                                    </span>
                                    <div>
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
                                    </div>
                                </li>
                            </ul>
                        </p>
                    </div>
                </div>
                <div v-if="currentModelId">
                    <p
                        class="cta"
                        v-html="$t('modules.tools.import3D.captions.editInfo')"
                    />
                    <p
                        v-if="currentProjection.id === 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                        class="cta red"
                        v-html="$t('modules.tools.import3D.captions.projectionInfo')"
                    />
                    <div class="h-seperator" />
                    <div class="form-group form-group-sm row">
                        <label
                            class="col-md-5 col-form-label"
                            for="tool-edit-projection"
                        >
                            {{ $t("modules.tools.import3D.projections.projection") }}
                        </label>
                        <div class="col-md-7">
                            <select
                                class="form-select form-select-sm"
                                aria-label="currentProjection"
                                @change="selectionChanged($event)"
                            >
                                <option
                                    v-for="(projection, i) in projections"
                                    :key="i"
                                    :value="projection.id"
                                    :SELECTED="projection.id === currentProjection.id"
                                >
                                    {{ projection.title ? projection.title : projection.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="h-seperator" />
                    <div>
                        <div class="form-group form-group-sm row">
                            <label
                                class="col-md-5 col-form-label"
                                for="eastingField"
                            >
                                {{ $t(getLabel("eastingLabel")) }}
                            </label>
                            <div class="col-md-7 position-control">
                                <input
                                    id="eastingField"
                                    v-model="coordinatesEasting.value"
                                    class="form-control form-control-sm"
                                    type="text"
                                    @input="updateEntityPosition"
                                >
                                <div
                                    v-if="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                                >
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="incrementCoordinate('easting')"
                                    >
                                        <i
                                            class="bi bi-arrow-up"
                                        />
                                    </button>
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="decrementCoordinate('easting')"
                                    >
                                        <i
                                            class="bi bi-arrow-down"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-group-sm row">
                            <label
                                class="col-md-5 col-form-label"
                                for="northingField"
                            >
                                {{ $t(getLabel("northingLabel")) }}
                            </label>
                            <div class="col-md-7 position-control">
                                <input
                                    id="northingField"
                                    v-model="coordinatesNorthing.value"
                                    class="form-control form-control-sm"
                                    type="text"
                                    @input="updateEntityPosition"
                                >
                                <div
                                    v-if="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                                >
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="incrementCoordinate('northing')"
                                    >
                                        <i
                                            class="bi bi-arrow-up"
                                        />
                                    </button>
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="decrementCoordinate('northing')"
                                    >
                                        <i
                                            class="bi bi-arrow-down"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-group-sm row">
                            <label
                                class="col-md-5 col-form-label"
                                for="heightField"
                            >
                                {{ $t("modules.tools.import3D.projections.height") }}
                            </label>
                            <div class="col-md-7 position-control">
                                <input
                                    id="heightField"
                                    v-model="height.value"
                                    class="form-control form-control-sm"
                                    type="text"
                                    @input="updateEntityPosition"
                                >
                                <div>
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="incrementCoordinate('height')"
                                    >
                                        <i
                                            class="bi bi-arrow-up"
                                        />
                                    </button>
                                    <button
                                        class="btn btn-primary btn-sm btn-pos"
                                        @click="decrementCoordinate('height')"
                                    >
                                        <i
                                            class="bi bi-arrow-down"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="h-seperator" />
                    <div>
                        <div class="form-group form-group-sm row">
                            <label
                                class="col-md-8 col-form-label"
                                for="tool-edit-rotation"
                            >
                                {{ $t("modules.tools.import3D.projections.rotation") }}
                            </label>
                            <div class="col-md-3">
                                <input
                                    id="tool-edit-rotation"
                                    v-model="rotationAngle"
                                    class="form-control form-control-sm"
                                    type="text"
                                    @input="rotate"
                                >
                            </div>
                        </div>
                        <div class="form-group form-group-sm row">
                            <div class="position-control">
                                <button
                                    class="btn btn-primary btn-sm"
                                    @click="decrementAngle"
                                >
                                    <i
                                        class="bi bi-arrow-left"
                                    />
                                </button>
                                <input
                                    id="tool-edit-rotation-slider"
                                    v-model="rotationAngle"
                                    aria-label="rotationSlider"
                                    class="font-arial form-range"
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    @input="rotate"
                                >
                                <button
                                    class="btn btn-primary btn-sm"
                                    @click="incrementAngle"
                                >
                                    <i
                                        class="bi bi-arrow-right"
                                    />
                                </button>
                            </div>
                        </div>
                        <div class="form-group form-group-sm row">
                            <label
                                class="col-md-7 col-form-label"
                                for="tool-edit-rotation-switch"
                            >
                                {{ $t("modules.tools.import3D.projections.rotationSwitch") }}
                            </label>
                            <div class="col-md-4">
                                <select
                                    v-model="rotationClickValue"
                                    class="form-select form-select-sm"
                                    aria-label="rotationClickValue"
                                >
                                    <option
                                        v-for="value in rotationDropdownValues"
                                        :key="value"
                                        :value="value"
                                    >
                                        {{ value }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="h-seperator" />
                    <button
                        id="tool-import3d-deactivateEditing"
                        class="btn btn-primary btn-sm btn-margin primary-button-wrapper"
                        @click="setCurrentModelId(null)"
                    >
                        {{ $t("modules.tools.import3D.backToList") }}
                    </button>
                </div>
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
        justify-content: space-between;
    }

    .error-text {
        font-size: 85%;
        color: $light_red;
    }
</style>
