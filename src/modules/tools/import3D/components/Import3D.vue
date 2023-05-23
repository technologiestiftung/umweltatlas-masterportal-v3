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

        cartographicComputed () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                entityPosition = entity.position.getValue();

            return Cesium.Cartographic.fromCartesian(entityPosition);
        },
        latComputed () {
            return Cesium.Math.toDegrees(this.cartographicComputed.latitude);
        },
        lonComputed () {
            return Cesium.Math.toDegrees(this.cartographicComputed.longitude);
        },
        altitudeComputed () {
            return this.cartographicComputed.height;
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
    updated () {
        // TODO: Eventuell woanders auslagern, wenn Component sich ändert!
        const scene = mapCollection.getMap("3D").getCesiumScene();

        this.eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        this.eventHandler.setInputAction(this.selectEntity, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
                    const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                        addedModel = entities.getById(this.currentModelId);

                    if (Cesium.defined(addedModel)) {
                        addedModel.position = position;
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
        selectEntity (event) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked.id, picked.primitive.id);

                if ("id" in entity) {
                    this.editMode(entity.id);
                }
            }
            return undefined;
        },
        editMode (id) {
            this.setCurrentModelId(id);
            this.setEditing(true);
        },
        changePosition (type, value) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                entityPosition = entity.position.getValue(),
                newPosition = Cesium.Cartographic.fromCartesian(entityPosition);

            newPosition.latitude = Cesium.Math.toDegrees(newPosition.latitude);
            newPosition.longitude = Cesium.Math.toDegrees(newPosition.longitude);

            if (type === "lat") {
                newPosition.latitude = parseFloat(value);
            }
            else if (type === "lon") {
                newPosition.longitude = parseFloat(value);
            }
            else if (type === "height") {
                newPosition.height = parseFloat(value);
            }

            entity.position = Cesium.Cartesian3.fromDegrees(newPosition.longitude, newPosition.latitude, newPosition.height);
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
                fileExtension = file.name.split(".").pop(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                models = this.importedModels;

            this.isDragging = true;

            if (fileExtension === "gltf") {
                reader.onload = () => {
                    const lastElement = entities.values.slice().pop(),
                        lastId = lastElement?.id,
                        entity = {
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
        :initial-width="300"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-import3d"
            >
                <div v-if="!editing">
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
                                            @click="editMode(model.id)"
                                            @keydown.enter="editMode(model.id)"
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
                <div v-if="editing">
                    <p
                        class="cta"
                        v-html="$t('modules.tools.import3D.captions.editInfo')"
                    />

                    <div>
                        <label
                            class="col-md-5 col-form-label"
                            for="tool-edit-x"
                        >
                            Longitude
                        </label>
                        <div class="col-md-7">
                            <input
                                id="tool-edit-x"
                                class="form-control form-control-sm"
                                type="text"
                                :value="lonComputed"
                                @input="changePosition('lon', $event.target.value)"
                            >
                        </div>
                        <label
                            class="col-md-5 col-form-label"
                            for="tool-edit-y"
                        >
                            Latitude
                        </label>
                        <div class="col-md-7">
                            <input
                                id="tool-edit-y"
                                class="form-control form-control-sm"
                                type="text"
                                :value="latComputed"
                                @input="changePosition('lat', $event.target.value)"
                            >
                        </div>
                        <label
                            class="col-md-5 col-form-label"
                            for="tool-edit-z"
                        >
                            Altitude
                        </label>
                        <div class="col-md-7">
                            <input
                                id="tool-edit-z"
                                class="form-control form-control-sm"
                                type="text"
                                :value="altitudeComputed"
                                @input="changePosition('height', $event.target.value)"
                            >
                        </div>
                    </div>
                    <button
                        id="tool-import3d-deactivateEditing"
                        class="btn btn-primary btn-sm btn-margin"
                        @click="setEditing(false)"
                    >
                        Zurück zur Übersicht
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

    .btn-margin {
        margin-top: 1em;
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
