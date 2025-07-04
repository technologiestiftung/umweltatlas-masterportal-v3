<script>

/**
* Snippet Tag
* @module modules/SnippetTag
* @vue-prop {Number} snippetId - The snippet id.
* @vue-prop {String} value - Shows if the checkbox is disabled.
* @vue-event {Number} deleteRule - Emits rule to delete by id.
*/
export default {
    name: "SnippetTag",
    props: {
        filterId: {
            type: Number,
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        value: {
            type: String,
            required: false,
            default: ""
        }
    },
    emits: ["deleteRule"],
    methods: {
        /**
         * Triggers the functions to reset the snippet and change the rules.
         * @returns {void}
         */
        removeTag () {
            this.$emit("deleteRule", this.snippetId, this.filterId);
        }
    }
};
</script>

<template>
    <div
        class="snippetTagContainer"
    >
        <button
            type="button"
            class="btn-tags"
            title="löschen"
            @click="removeTag()"
            @keydown.enter="removeTag()"
        >
            <span class="snippetTagValue float-lg-start">{{ value }}</span>
            <span class="bi bi-x-lg float-end" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
    @import "~mixins";
    @import "~variables";
    .snippetTagContainer {
        margin: 0 0 2px 2px;
        float: left;

        .snippetTagLabel {
            font-size: $font-size-sm;
        }

        button {
            padding: 5px 6px 2px;
            font-size: $font-size-base;
            background-color: $primary;
            border: none;
            border-radius: 20px;
            &:hover {
                opacity: 1;
                background-color: $dark_blue;
                color: $white;
                cursor: pointer;
            }
        }
    }
    .snippetTagContainer .snippetTagValue {
        padding-right: 5px;
    }
    .bi-x-lg:hover {
        color: $light_red;
    }
</style>
