<script>
export default {
    name: "StatisticDashboardLegend",
    props: {
        legendValue: {
            type: Array,
            required: true
        }
    }
};
</script>

<template>
    <div class="legend-content">
        <div
            v-for="legendObj in legendValue"
            :key="legendObj.name"
            class="layer"
        >
            <img
                :alt="legendObj.name ? legendObj.name : legendObj.name"
                :src="legendObj.graphic"
                class="left"
            >
            <span>
                {{ legendObj.name }}
            </span>
        </div>
    </div>
</template>

<style scoped>

</style>
