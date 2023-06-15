<script>
import BasicFileImport from "../../../../share-components/fileImport/components/BasicFileImport.vue";
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
    components: {
        BasicFileImport
    },
    emits: ["moveEntity"],
    data () {
        return {
            isHovering: false
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

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
                    store.dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: fileExtension})}, {root: true});
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading the file:", e.target.error);
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
        changeVisibility (model) {
            const entities = this.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        moveEntity () {
            this.$emit("emit-move");
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
        }
    }
};
</script>

<template lang="html">
    <div>
        <BasicFileImport
            :intro-formats="$t('modules.tools.modeler3D.import.captions.introFormats')"
            @add-file="addFile"
        />

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
