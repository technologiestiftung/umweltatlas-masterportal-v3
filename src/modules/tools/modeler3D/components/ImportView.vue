<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import store from "../../../../app-store";

export default {
    name: "ImportView",
    emits: ["moveEntity"],
    data () {
        return {
            dzIsDropHovering: false,
            isHovering: false
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        /**
         * Returns an additional CSS class for the drop zone based on whether it is currently in a drop-hover state.
         * @returns {string} - The additional CSS class for the drop zone.
         */
        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        /**
         * Handles the drag enter event for a drop zone and sets the flag to indicate drop hovering.
         * @returns {void}
         */
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        /**
         * Handles the drag end event for a drop zone and resets the flag indicating drop hovering.
         * @returns {void}
         */
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        /**
         * Handles the mouse enter event for a drop zone and sets the flag to indicate hovering.
         * @returns {void}
         */
        onDZMouseenter () {
            this.dzIsHovering = true;
        },
        /**
         * Handles the mouse leave event for a drop zone and resets the flag indicating hovering.
         * @returns {void}
         */
        onDZMouseleave () {
            this.dzIsHovering = false;
        },
        /**
         * Handles the input change event and processes the selected files.
         * @param {Event} e - The input change event object.
         * @returns {void}
         */
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
            }
            this.$refs["upload-input-file"].value = "";
        },
        /**
         * Handles the drop event and processes the dropped files.
         * @param {Event} e - The drop event object.
         * @returns {void}
         */
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        /**
         * Adds and processes the selected file.
         *
         * @param {FileList} files - The selected files.
         * @returns {void}
         */
        addFile (files) {
            const reader = new FileReader(),
                file = files[0],
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop(),
                fileSizeMB = file.size / (1024 * 1024),
                maxFileSizeMB = 100;

            if (fileSizeMB > maxFileSizeMB) {
                store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.modeler3D.import.alertingMessages.fileSizeError"), {root: true});
                return;
            }

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
        /**
         * Handles the processing of a GLTF file.
         *
         * @param {File} file - The GLTF file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
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
            this.moveEntity();

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
        /**
         * Handles the processing of an OBJ file.
         * @param {File} file - The OBJ file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
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
        /**
         * Handles the processing of a DAE file.
         * @param {File} file - The DAE file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
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
        /**
         * Triggers a click event on the file input element when the spacebar or enter key is pressed.
         * @param {Event} event - The keydown event object.
         * @returns {void}
         */
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
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
         * Triggers an event to indicate that the entity should be moved.
         * @emits emit-move
         * @returns {void}
         */
        moveEntity () {
            this.$emit("emit-move");
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
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
        }
    }
};
</script>

<template lang="html">
    <div>
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.import.captions.introInfo')"
        />
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.import.captions.introFormats')"
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
                    {{ $t("modules.tools.modeler3D.import.captions.dropzone") }}
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
                {{ $t("modules.tools.modeler3D.import.captions.browse") }}
            </label>
        </div>

        <div v-if="importedModels.length > 0">
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
                                :title="$t(`common:modules.tools.modeler3D.entity.captions.zoomTo`, {name: model.name})"
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
        cursor: text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
            border-color: #8098b1;
            outline: 0;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 0 0.25rem rgba(0, 48, 99, 0.25);
        }
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

    ul {
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
