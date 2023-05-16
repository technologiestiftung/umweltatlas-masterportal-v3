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
            dzIsDropHovering: false,
            storePath: this.$store.state.Tools.Import3D
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
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
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
                                    {{ model.id }} - {{ model.name }}
                                </span>
                                <div>
                                    <span
                                        class="inline-button"
                                        :title="$t(`common:modules.tools.import3D.zoomTo`, {name: model.name})"
                                    >
                                        <i class="bi bi-geo-alt" />
                                    </span>
                                    <span
                                        class="inline-button"
                                        :title="$t(`common:modules.tools.import3D.editModel`, {name: model.name})"
                                        @click="editModel(model)"
                                        @keydown.enter="editModel(model)"
                                    >
                                        <i class="bi bi-pencil" />
                                    </span>
                                    <span
                                        class="inline-button"
                                        :title="$t(`common:modules.tools.import3D.visibilityTitle`, {name: model.name})"
                                        @click="changeVisibility(model)"
                                        @keydown.enter="changeVisibility(model)"
                                    >
                                        <i
                                            v-if="model.show"
                                            class="bi bi-eye-slash"
                                        />
                                        <i
                                            v-else
                                            class="bi bi-eye"
                                        />
                                    </span>
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
        font-size: $font_size_big;
    }

    ul {
        list-style-type: none;
    }

    li {
        display: flex;
        justify-content: space-between;
    }
</style>
