<script>
import {mapGetters, mapMutations} from "vuex";
import TableComponent from "../../../../share-components/table/components/TableComponent.vue";
import {getComponent} from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import getters from "../store/gettersStatisticDashboard";
import mutations from "../store/mutationsStatisticDashboard";
import Controls from "./StatisticDashboardControls.vue";
import StatisticFilter from "./StatisticDashboardFilter.vue";

export default {
    name: "StatisticDashboard",
    components: {
        ToolTemplate,
        TableComponent,
        Controls,
        StatisticFilter
    },
    data () {
        return {
            data: {
                headers: ["Raumeinheit", "2023", "2022"],
                items: [
                    ["Harburg", 1234, 1234],
                    ["Ludwigslust Parchim", 23456, 1234],
                    ["Lübeck", 23475, 1234],
                    ["Niedersachsen", 34844, 1234]
                ]
            },
            selectMode: "column",
            showHeader: true,
            sortable: true
        };
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
            <div class="row justify-content-between">
                <div class="col-md-4">
                    <h4>{{ $t("common:modules.tools.statisticDashboard.headings.mrhstatistics") }}</h4>
                </div>
                <div class="col-md-auto">
                    <div class="btn-group btn-group-sm me-2">
                        <input
                            id="btnradio3"
                            type="radio"
                            class="btn-check"
                            name="btnradioArea"
                            autocomplete="off"
                            checked
                        >
                        <label
                            class="btn btn-outline-primary"
                            for="btnradio3"
                            role="button"
                            tabindex="0"
                        >{{ $t("common:modules.tools.statisticDashboard.label.communities") }}
                        </label>
                        <input
                            id="btnradio4"
                            type="radio"
                            class="btn-check"
                            name="btnradioArea"
                            autocomplete="off"
                        >
                        <label
                            class="btn btn-outline-primary"
                            for="btnradio4"
                            role="button"
                            tabindex="0"
                        >
                            {{ $t("common:modules.tools.statisticDashboard.label.districts") }}
                        </label>
                    </div>
                </div>
            </div>
            <StatisticFilter
                :category="['Kategorie1', 'Kategorie2', 'Kategorie3']"
                :sub-category="['Bevölkerungswachstum', 'Bruttoinlandsprodukt', 'Ausländer:innenanteil']"
                :time-steps-filter="{
                    5: 'Die letzten 5 Jahre',
                    10: 'Die letzten 10 Jahre',
                    all: 'Alle Jahre'
                }"
                :areas="['Harburg', 'Lübeck', 'Schwerin']"
            />
            <hr>
            <Controls
                :descriptions="[{
                                    title: 'Trappatoni 1',
                                    content: 'Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind.'
                                },
                                {
                                    title: 'Trappatoni 2 ',
                                    content: 'Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen.'
                                },
                                {
                                    title: 'Trappatoni 3 ',
                                    content: 'Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler.'
                                }]"
            />
            <TableComponent
                :data="data"
                :select-mode="selectMode"
                :show-header="showHeader"
                :sortable="sortable"
            />
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
