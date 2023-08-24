<script>
import {mapGetters, mapMutations} from "vuex";
import {getComponent} from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import getters from "../store/gettersStatisticDashboard";
import mutations from "../store/mutationsStatisticDashboard";

export default {
    name: "StatisticDashboard",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/StatisticDashboard", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/StatisticDashboard", Object.keys(mutations)),

        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            test
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
