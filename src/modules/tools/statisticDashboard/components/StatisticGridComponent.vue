<script>
export default {
    name: "StatisticGridComponent",
    props: {
        dates: {
            type: Array,
            required: false,
            default: undefined
        },
        chartsCount: {
            type: Number,
            required: false,
            default: undefined
        }
    }
};
</script>

<template>
    <div>
        <div
            v-if="Array.isArray(dates)"
            class="flex-container"
        >
            <div
                v-for="(data, idx) in dates"
                :key="idx"
                class="flex-item"
            >
                <slot
                    name="containers"
                    :data="data"
                />
            </div>
        </div>
        <div
            v-else-if="typeof chartsCount === 'number'"
            class="flex-container"
        >
            <div
                v-for="idx in chartsCount"
                :key="idx"
                class="flex-item"
            >
                <slot
                    name="chartContainers"
                    :data="{id: idx}"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.flex-container {
    display:flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    max-width: 900px;
    margin-top: 30px;
}

.flex-item {
    flex: 0 1 auto;
    flex-basis: 30%;
    flex-grow: 1;
    flex-shrink: 1;
    border: 2px solid #e3e3e3;
    max-width: 280px;
    min-width: 260px;
    margin: 10px;
    border-radius: 5px;
    &:hover {
        border: 2px solid $primary;
        background-color: #f8f9fa;
    }
}

.flex-container .mx-5 {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    margin-right: 0px !important;
    margin-left: 0px !important;
}

.flex-container .my-5 {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    margin-left: 0px !important;
    margin-left: 0px !important;
}
</style>
