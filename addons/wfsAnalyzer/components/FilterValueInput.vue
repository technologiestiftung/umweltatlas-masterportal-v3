<script>
/**
 * A value field for one attribute: type to filter, pick from the values the
 * service knows. The values are fetched when the field is focused, so nothing
 * is loaded for attributes the user never touches.
 * @module addons/wfsAnalyzer/components/FilterValueInput
 */

/**
 * Milliseconds after which a still running lookup is worth mentioning.
 * @type {Number}
 */
const slowAfter = 2500;

export default {
    name: "FilterValueInput",
    props: {
        /** Id of the input, used for the label and the datalist. */
        id: {
            type: String,
            required: true
        },
        /** Visible label. */
        label: {
            type: String,
            required: true
        },
        /** The current value. */
        value: {
            type: String,
            default: ""
        },
        /** What is known about the attribute's values as {values, truncated, status}. */
        valueState: {
            type: Object,
            required: true
        }
    },
    emits: ["load", "change"],
    data () {
        return {
            takesLong: false,
            slowTimeout: null
        };
    },
    computed: {
        /**
         * @returns {Boolean} true while the values are being collected.
         */
        isLoading () {
            return this.valueState.status === "loading";
        }
    },
    watch: {
        /**
         * Only mentions a slow lookup once it really is slow - a fast one should
         * pass by unremarked.
         * @param {String} status the new status.
         * @returns {void}
         */
        "valueState.status": {
            handler (status) {
                this.clearSlowTimeout();
                this.takesLong = false;

                if (status === "loading") {
                    this.slowTimeout = setTimeout(() => {
                        this.takesLong = true;
                    }, slowAfter);
                }
            },
            immediate: true
        }
    },
    beforeUnmount () {
        this.clearSlowTimeout();
    },
    methods: {
        /**
         * @returns {void}
         */
        clearSlowTimeout () {
            if (this.slowTimeout !== null) {
                clearTimeout(this.slowTimeout);
                this.slowTimeout = null;
            }
        }
    }
};
</script>

<template>
    <div>
        <label
            class="form-label"
            :for="id"
        >
            {{ label }}
        </label>
        <div class="position-relative">
            <input
                :id="id"
                class="form-control form-control-sm"
                type="text"
                :list="`${id}-values`"
                :value="value"
                autocomplete="off"
                @focus="$emit('load')"
                @change="$emit('change', $event.target.value)"
            >
            <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm wfs-analyzer-field-spinner"
                role="status"
                :aria-label="$t('additional:modules.wfsAnalyzer.filter.loadingValues')"
            />
        </div>
        <datalist :id="`${id}-values`">
            <option
                v-for="entry in valueState.values"
                :key="entry"
                :value="entry"
            />
        </datalist>

        <p
            v-if="takesLong && isLoading"
            class="form-text mb-0"
        >
            {{ $t("additional:modules.wfsAnalyzer.filter.loadingValuesSlow") }}
        </p>
        <div
            v-else-if="valueState.status === 'ready' && valueState.truncated"
            class="alert alert-warning py-1 px-2 mt-1 mb-0 small"
            role="status"
        >
            <i class="bi bi-exclamation-triangle-fill me-1" />
            {{ $t("additional:modules.wfsAnalyzer.filter.valuesLoadedPartly", {count: valueState.values.length}) }}
        </div>
        <p
            v-else-if="valueState.status === 'error'"
            class="form-text mb-0"
        >
            {{ $t("additional:modules.wfsAnalyzer.filter.valuesUnavailable") }}
        </p>
    </div>
</template>

<style lang="scss" scoped>
.wfs-analyzer-field-spinner {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 14px;
    height: 14px;
    margin-top: -7px;
    border-width: 2px;
    opacity: 0.6;
    pointer-events: none;
}
</style>
