<script>
import ToolTemplate from "../../ToolTemplate.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsImport3D";
import getters from "../store/gettersImport3D";
import mutations from "../store/mutationsImport3D";

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
            eventHandler: null
        };
    },
    computed: {
        ...mapGetters("Tools/Import3D", Object.keys(getters)),
        selectedFiletype: {
            get () {
                return this.storePath.selectedFiletype;
            },
            set (value) {
                this.setSelectedFiletype(value);
            }
        },

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
                this.setFocusToFirstControl();
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

                if (Cesium.defined(position)) {
                    const primitives = scene.primitives,
                        addedModel = this.getPrimitiveById(primitives, this.currentModelId);

                    if (Cesium.defined(addedModel)) {
                        const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);

                        addedModel.modelMatrix = modelMatrix;
                    }
                }
            }
        },
        getPrimitiveById (primitives, id) {
            for (let i = 0; i < primitives.length; i++) {
                const primitive = primitives.get(i);

                if (primitive.id === id) {
                    return primitive;
                }
            }
            return undefined;
        },
        onMouseUp () {
            if (this.isDragging) {
                this.removeInputActions();
                this.isDragging = false;
            }
        },
        removeInputActions () {
            if (this.eventHandler) {
                this.eventHandler.destroy();
            }
        },
        addFile (files) {
            const reader = new FileReader(),
                file = files[0],
                fileExtension = file.name.split(".").pop(),
                scene = mapCollection.getMap("3D").getCesiumScene(),
                primitives = scene.primitives,
                models = this.importedModels;

            this.isDragging = true;
            this.eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            if (fileExtension === "gltf") {
                reader.onload = () => {
                    const model = Cesium.Model.fromGltf({
                            url: URL.createObjectURL(file)
                        }),
                        hasGeoreferencing = Boolean(model.extras?.georeferencing);
                    let position, modelMatrix;

                    model.id = primitives.length - 4;
                    this.setCurrentModelId(model.id);

                    if (hasGeoreferencing) {
                        position = Cesium.Cartesian3.fromDegrees(
                            model.extras.georeferencing.longitude,
                            model.extras.georeferencing.latitude,
                            model.extras.georeferencing.altitude
                        );
                        modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                        model.modelMatrix = modelMatrix;
                    }
                    else {
                        this.eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        this.eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
                    }

                    primitives.add(model);
                    URL.revokeObjectURL(model.url);

                    models.push({
                        id: model.id,
                        name: file.name,
                        show: true
                    });

                    this.setImportedModels(models);
                };
            }
            else {
                console.error(fileExtension + " files are currently not supported!");
            }
            reader.onerror = (e) => {
                console.error("Fehler beim Lesen der Datei:", e.target.error);
            };
            reader.readAsArrayBuffer(file);
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        changeVisibility (model) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                prim = scene.primitives._primitives.find(x => x.id === model.id);

            prim.show = !model.show;
            model.show = prim.show;
        },
        editModel () {
            // TODO: Neues Component erstellen und aktivieren
        },
        zoomTo (position) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                currentPosition = scene.camera.positionCartographic;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], currentPosition.height)
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
        :initial-width="300"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-import3d"
            >
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
                        class="upload-button-wrapper"
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
                                    {{ model.id }}
                                </span>
                                <span>
                                    {{ model.name }}
                                </span>
                                <div>
                                    <i
                                        class="inline-button bi"
                                        :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                                        :title="$t(`common:modules.tools.import3D.zoomTo`, {name: model.name})"
                                        @click="zoomTo(model.position)"
                                        @keydown.enter="zoomTo(model.position)"
                                        @mouseover="isHovering = `${index}-geo`"
                                        @mouseout="isHovering = false"
                                        @focusin="isHovering = `${index}-geo`"
                                        @focusout="isHovering = false"
                                    />
                                    <i
                                        class="inline-button bi"
                                        :class="{ 'bi-pencil-fill': isHovering === `${index}-edit`, 'bi-pencil': isHovering !== `${index}-edit`}"
                                        :title="$t(`common:modules.tools.import3D.editModel`, {name: model.name})"
                                        @click="editModel(model.id)"
                                        @keydown.enter="editModel(model.id)"
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

    .upload-button-wrapper {
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
    }

    .inline-button:hover {
        transform: translateY(-2px);
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
</style>
