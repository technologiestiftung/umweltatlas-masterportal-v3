<script>
export default {
    name: "Modeler3DList",
    props: {
        objects: {
            type: Array,
            required: true
        },
        objectsLabel: {
            type: String,
            required: true
        },
        entity: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data () {
        return {
            isHovering: ""
        };
    }
};
</script>

<template>
    <div class="objectList">
        <div class="h-seperator" />
        <label
            class="objectListLabel"
            for="objects"
        >
            {{ objectsLabel }}
        </label>
        <ul>
            <li
                v-for="(object, index) in objects"
                :key="index"
            >
                <span class="index">
                    {{ index + 1 }}
                </span>
                <input
                    v-if="entity && object.edit"
                    v-model="object.name"
                    class="input-name editable"
                    @blur="object.edit = false"
                    @keyup.enter="object.edit = false"
                >
                <span
                    v-else-if="entity && !object.edit"
                    role="button"
                    class="input-name editable"
                    tabindex="-1"
                    @click="object.edit = true"
                    @keyup.enter="object.edit = true"
                >
                    {{ object.name }}
                </span>
                <span
                    v-else
                    class="input-name"
                >
                    {{ object.name }}
                </span>
                <div class="buttons">
                    <i
                        v-if="entity"
                        id="list-zoomTo"
                        class="inline-button bi"
                        :class="{ 'bi-geo-alt-fill': isHovering === `${index}-geo`, 'bi-geo-alt': isHovering !== `${index}-geo`}"
                        :title="$t(`common:modules.tools.modeler3D.entity.captions.zoomTo`, {name: object.name})"
                        @click="$emit('zoom-to', object.id)"
                        @keydown.enter="$emit('zoom-to', object.id)"
                        @mouseover="isHovering = `${index}-geo`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-geo`"
                        @focusout="isHovering = false"
                    />
                    <i
                        v-if="entity"
                        id="list-edit"
                        class="inline-button bi"
                        :class="{ 'bi-pencil-fill': isHovering === `${index}-edit`, 'bi-pencil': isHovering !== `${index}-edit`}"
                        :title="$t(`common:modules.tools.modeler3D.entity.captions.editModel`, {name: object.name})"
                        @click="$emit('set-current-model-id', object.id)"
                        @keydown.enter="$emit('set-current-model-id', object.id)"
                        @mouseover="isHovering = `${index}-edit`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-edit`"
                        @focusout="isHovering = false"
                    />
                    <i
                        v-if="object.show"
                        id="list-show"
                        class="inline-button bi"
                        :class="{ 'bi-eye-slash-fill': isHovering === `${index}-hide`, 'bi-eye': isHovering !== `${index}-hide`}"
                        :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
                        @click="$emit('change-visibility', object)"
                        @keydown.enter="$emit('change-visibility', object)"
                        @mouseover="isHovering = `${index}-hide`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-hide`"
                        @focusout="isHovering = false"
                    />
                    <i
                        v-else
                        id="list-hide"
                        class="inline-button bi"
                        :class="{ 'bi-eye-fill': isHovering === `${index}-show`, 'bi-eye-slash': isHovering !== `${index}-show`}"
                        :title="$t(`common:modules.tools.modeler3D.entity.captions.visibilityTitle`, {name: object.name})"
                        @click="$emit('change-visibility', object)"
                        @keydown.enter="$emit('change-visibility', object)"
                        @mouseover="isHovering = `${index}-show`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-show`"
                        @focusout="isHovering = false"
                    />
                    <i
                        v-if="entity"
                        id="list-delete"
                        class="inline-button bi"
                        :class="{ 'bi-trash3-fill': isHovering === `${index}-del`, 'bi-trash3': isHovering !== `${index}-del`}"
                        :title="$t(`common:modules.tools.modeler3D.entity.captions.deletionTitle`, {name: object.name})"
                        @click="$emit('confirm-deletion', object.id)"
                        @keydown.enter="$emit('confirm-deletion', object.id)"
                        @mouseover="isHovering = `${index}-del`"
                        @mouseout="isHovering = false"
                        @focusin="isHovering = `${index}-del`"
                        @focusout="isHovering = false"
                    />
                </div>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .objectListLabel {
        font-weight: bold;
    }

    .objectList {
        font-size: $font_size_icon_lg;
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

    .index {
        width: 15%;
    }

    .input-name {
        width: 60%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .editable {
        cursor: text;

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
</style>
