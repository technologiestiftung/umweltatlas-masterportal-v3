<script>

/**
 * Elevated Button component: A simple button that looks elevated from its background.
 * @module shared/modules/buttons/ElevatedButton
 * @vue-prop {String} text holds the Button-text.
 * @vue-prop {function} interaction binds a function to a click on the button.
 * @vue-prop {String} icon defines the Icon to be displayed alongside the text inside the button.
 */
export default {
    name: "ElevatedButton",
    props: {
        text: {
            type: String,
            required: true
        },
        interaction: {
            type: Function,
            required: true
        },
        icon: {
            type: String,
            default: null,
            required: false
        }
    }
};
</script>

<template>
    <button
        class="btn btn-primary d-flex align-items-center shadow"
        type="button"
        :aria-label="text"
        @click="interaction"
    >
        <i
            v-if="icon !== null"
            :class="icon"
            class="ua-elevated-btn-icon"
            role="img"
        />
        <span class="ua-btn-text">
            {{ $t(text) }}
        </span>
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";
@import "~mixins";

.btn {
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    height: 3.5rem;
    min-width: 5rem;
    width: fit-content;
    max-width: 100%;
    padding-right: 1.5rem;
    padding-left: 1rem;

    .ua-elevated-btn-icon {
        font-size: 1.5rem;
        padding-right: .5rem;
        flex-shrink: 0;
    }

    .ua-btn-text {
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
