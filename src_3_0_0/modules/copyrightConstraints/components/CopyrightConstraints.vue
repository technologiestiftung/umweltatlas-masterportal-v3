<script>
import getCswRecordById from "../../../shared/js/api/getCswRecordById";
import store from "../../../app-store";

export default {
    name: "CopyrightConstraints",
    components: {},
    data () {
        return {
            contraints: [],
            ready: false
        };
    },
    computed: {
        getContraints: function () {
            return this.contraints;
        }
    },
    mounted () {
        this.getCswContraints();
        this.ready = true;
    },
    methods: {
        getCswContraints () {
            const visibleLayerList = this.getVisibleLayer(),
                getMetaData = function (id) {
                    return new Promise((resolve) => {
                        const metadata = getCswRecordById.getRecordById(
                            "https://gdk.gdi-de.org/gdi-de/srv/ger/csw",
                            id
                        );

                        resolve(metadata);
                    });
                };

            visibleLayerList.forEach((element) => {
                getMetaData(element).then((metadata) => {
                    this.contraints.push({
                        title: metadata?.getTitle(),
                        accessConstraints: metadata?.getConstraints()?.access,
                        useConstraints: metadata?.getConstraints(true)?.use,
                        pointOfContact: metadata?.getContact()
                    });
                });
            });
        },

        /**
         * sets the visible layers and set into variable
         * @param {Boolean} [printMapMarker=false] whether layer "markerPoint" should be filtered out
         * @returns {void}
         */
        getVisibleLayer (printMapMarker = false) {
            const layers = mapCollection.getMap("2D").getLayers(),
                visibleLayerList =
                    typeof layers?.getArray !== "function"
                        ? []
                        : layers.getArray().filter((layer) => {
                            return (
                                layer.getVisible() === true &&
                                (layer.get("name") !== "markerPoint" ||
                                    printMapMarker)
                            );
                        }),
                visibleLayerListIds = [],
                visibleLayerListMdIds = [];

            visibleLayerList.forEach((layer) => {
                if (layer.values_.id) {
                    visibleLayerListIds.push(layer.values_.id);
                }
            });

            store.getters.allLayerConfigs.forEach((layer) => {
                if (visibleLayerListIds.includes(layer.id)) {
                    if (layer.datasets[0]?.md_id) {
                        visibleLayerListMdIds.push(layer.datasets[0]?.md_id);
                    }
                }
            });

            return visibleLayerListMdIds;
        }
    }
};
</script>

<template lang="html">
    <div
        id="copyrightConstraints"
        class="infoText"
    >
        <div v-if="ready">
            <div
                v-if="getContraints.length > 0"
                :key="constrainsList"
            >
                <ul>
                    <li
                        v-for="(constraintsPerLayer, index) in getContraints"
                        :key="index"
                    >
                        {{ constraintsPerLayer.title }}
                        <div v-if="constraintsPerLayer.accessConstraints">
                            <ul>
                                <li
                                    v-if="constraintsPerLayer.accessConstraints"
                                    class="copyright-details"
                                    v-html="constraintsPerLayer.accessConstraints.trim()"
                                >
                                </li>
                                <li
                                    v-for="useConstraint in constraintsPerLayer.useConstraints"
                                    class="copyright-details"
                                    v-html="useConstraint.trim()"
                                >
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <div><i>{{ $t("common:modules.copyrightConstraints.notSpecified") }}</i></div>
                            <ul>
                                <li v-if="constraintsPerLayer.pointOfContact?.name">
                                    <div class="organisation">
                                        {{ $t("common:modules.copyrightConstraints.contactOrganisation") }}: {{ constraintsPerLayer.pointOfContact?.name }}
                                    </div>
                                </li>
                                <li v-if="constraintsPerLayer.pointOfContact?.positionName && constraintsPerLayer.pointOfContact?.positionName?.length === 1">
                                    <div class="name">
                                        {{ $t("common:modules.copyrightConstraints.contactName") }}: {{ constraintsPerLayer.pointOfContact?.positionName }}
                                    </div>
                                </li>
                                <li v-if="constraintsPerLayer.pointOfContact?.phone">
                                    <div class="">
                                        {{ $t("common:modules.copyrightConstraints.contactPhone") }}:
                                        {{ constraintsPerLayer.pointOfContact?.phone }}
                                    </div>
                                </li>
                                <li v-if="constraintsPerLayer.pointOfContact?.email">
                                    <div class="email">
                                        {{ $t("common:modules.copyrightConstraints.contactEmail") }}:
                                        <a
                                            class="eMailLink"
                                            :href="'mailto:' + constraintsPerLayer.pointOfContact?.email"
                                        > {{ constraintsPerLayer.pointOfContact?.email }}</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else>
            {{ $t("common:modules.copyrightConstraints.wait") }}...
        </div>
    </div>
</template>

<style scoped>
    .infoText {
        max-width: 95ch;
        word-break: break-word;
    }

    .copyright-details {
        white-space: pre-line;
    }
</style>
