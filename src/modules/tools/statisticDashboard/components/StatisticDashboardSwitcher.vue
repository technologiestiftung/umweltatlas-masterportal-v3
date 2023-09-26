<script>

export default {
    name: "StatisticDashboardSwitcher",
    props: {
        buttons: {
            type: Array,
            required: true
        },
        group: {
            type: String,
            required: true
        }
    }
};

</script>

<template>
    <div class="switchButtons me-2 pb-1">
        <div
            v-for="(data, idx) in buttons"
            :key="idx"
            class="btn-group btn-group-sm"
            role="group"
            aria-label="First group"
        >
            <input
                :id="`btnradio${idx}${data.name}`"
                type="radio"
                class="btn-check"
                :name="group"
                autocomplete="off"
                :checked="idx === 0"
            >
            <label
                class="btn btn-outline-primary"
                :for="`btnradio${idx}${data.name}`"
                role="button"
                tabindex="0"
                @click="$emit('showView', data.name)"
                @keydown="$emit('showView', data.name)"
            >
                <i
                    v-if="data.icon"
                    :class="`${data.icon} pe-2`"
                />{{ data.name }}
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.btn-outline-primary, .btn-outline-primary:hover, .btn-outline-primary:focus-visible {
    color: $light_blue;
    border-color: $light_blue;
}
.btn-check:checked + .btn, :not(.btn-check) + .btn:active, .btn:first-child:active, .btn.active, .btn.show{
    background-color: $light_blue;
    border-color: $light_blue;
    color: $white;
}


</style>
