<script>
export default {
    name: "BasicFileImport",
    props: {
        introInfo: {
            type: String,
            default () {
                return i18next.t("common:share-components.import.introInfo");
            },
            required: false
        },
        dropZone: {
            type: String,
            default () {
                return i18next.t("common:share-components.import.dropzone");
            },
            required: false
        },
        introFormats: {
            type: String,
            required: true
        }
    },
    emits: [
        "add-file"
    ],
    data () {
        return {
            dzIsDropHovering: false
        };
    },
    computed: {
        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    methods: {
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
                this.$emit("add-file", e.target.files);
            }
        },
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.$emit("add-file", e.dataTransfer.files);
            }
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        }
    }
};
</script>

<template lang="html">
    <div>
        <p
            class="cta"
            v-html="introInfo"
        />
        <p
            class="cta"
            v-html="introFormats"
        />
        <div
            class="vh-center-outer-wrapper drop-area-fake"
            :class="dropZoneAdditionalClass"
        >
            <div class="vh-center-inner-wrapper">
                <p class="caption">
                    {{ dropZone }}
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
                {{ $t("share-components.import.browse") }}
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

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
</style>
