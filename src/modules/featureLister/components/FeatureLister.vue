<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "@shared/js/utils/isPhoneNumber.js";
import {isWebLink} from "@shared/js/utils/urlHelper";
import {isEmailAddress} from "@shared/js/utils/isEmailAddress";
import toBold from "@shared/js/utils/toBold";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import TableComponent from "@shared/modules/table/components/TableComponent.vue";
import tabStatus from "../tabStatus.js";

/**
 * Feature Lister
 * @module modules/FeatureLister
 * @vue-data {String} enabledTabClass - The CSS-Class for the enabled tab.
 * @vue-data {String} activeTabClass - The CSS-Class "active" tab.
 * @vue-data {String} visibleVectorLayers - All visible vector layers.
 * @vue-data {String} supportedLayerTypes - "WFS", "OAF", "GeoJSON"
 * @vue-computed {String} themeTabClasses - The class for the current theme-tab.
 * @vue-computed {String} listTabClasses - The class for the current list-tab.
 * @vue-computed {String} detailsTabClasses - The class for the current details-tab.
 */
export default {
    name: "FeatureLister",
    components: {
        FlatButton,
        TableComponent
    },
    data () {
        return {
            enabledTabClass: "",
            activeTabClass: "active",
            disabledTabClass: "disabled",
            supportedLayerTypes: ["WFS", "OAF", "GeoJSON"],
            tabStatus: tabStatus
        };
    },
    computed: {
        ...mapGetters(["visibleLayerConfigs"]),
        ...mapGetters("Modules/FeatureLister", [
            "maxFeatures",
            "layer",
            "layerListView",
            "featureCount",
            "shownFeatures",
            "featureListView",
            "featureDetailView",
            "headers",
            "featureProperties",
            "selectedRow",
            "gfiFeaturesOfLayer"
        ]),
        tableData () {
            return {
                headers: this.headers,
                items: this.featureProperties.slice(0, this.shownFeatures)
            };
        },
        themeTabClasses: function () {
            return this.layerListView ? this.activeTabClass : this.defaultTabClass;
        },
        listTabClasses: function () {
            if (this.featureListView) {
                return this.activeTabClass;
            }
            if (this.featureDetailView) {
                return this.defaultTabClass;
            }
            return this.disabledTabClass;
        },
        detailsTabClasses: function () {
            if (this.featureDetailView) {
                return this.activeTabClass;
            }
            if (this.selectedRow !== null) {
                return this.defaultTabClass;
            }
            return this.disabledTabClass;
        },
        visibleVectorLayers () {
            return this.visibleLayerConfigs
                .filter(layer => this.supportedLayerTypes.includes(layer.typ))
                .map(layer => ({
                    name: layer.name,
                    id: layer.id
                }));
        }
    },
    unmounted () {
        this.resetToThemeChooser();
        this.removeHighlightFeature();
    },
    methods: {
        ...mapActions("Modules/FeatureLister", [
            "switchBackToList",
            "switchToList",
            "clickOnFeature",
            "hoverOverFeature",
            "switchToThemes",
            "switchToDetails",
            "showMore"
        ]),
        ...mapActions("Maps", ["removeHighlightFeature"]),
        ...mapMutations("Modules/FeatureLister", [
            "resetToThemeChooser"
        ]),
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        toBold,
        removeVerticalBar (value) {
            return value.replaceAll("|", "<br>");
        },
        tabClasses: function (view) {
            switch (view) {
                case tabStatus.ACTIVE:
                    return this.activeTabClass;
                case tabStatus.ENABLED:
                    return this.enabledTabClass;
                case tabStatus.DISABLED:
                    return this.disabledTabClass;
                default:
                    return this.disabledTabClass;
            }
        }
    }
};
</script>

<template lang="html">
    <div id="feature-lister">
        <ul class="nav nav-tabs">
            <li
                id="module-feature-lister-themeChooser"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="tabClasses(layerListView)"
                    @click.prevent="switchToThemes()"
                >{{ $t("common:modules.featureLister.chooseTheme") }}</a>
            </li>
            <li
                id="module-feature-lister-list"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="tabClasses(featureListView)"
                    @click.prevent="switchBackToList()"
                >{{ $t("common:modules.featureLister.list") }}</a>
            </li>
            <li
                id="module-feature-lister-details"
                role="presentation"
                class="nav-item"
            >
                <a
                    href="#"
                    class="nav-link"
                    :class="tabClasses(featureDetailView)"
                    @click.prevent="switchToDetails()"
                >{{ $t("common:modules.featureLister.details") }}</a>
            </li>
        </ul>
        <div
            v-if="layerListView === tabStatus.ACTIVE"
            id="feature-lister-themes"
            class="feature-lister-themes panel panel-default"
        >
            <div
                id="feature-lister-themes-header"
                class="panel-heading"
            >
                {{ $t("common:modules.featureLister.visibleVectorLayers") }}
            </div>
            <ul
                v-for="layer in visibleVectorLayers"
                id="feature-lister-themes-ul"
                :key="'module-feature-lister-' + layer.id"
                class="nav flex-column"
            >
                <li
                    :id="'feature-lister-layer-' + layer.id"
                    class="nav-item"
                    role="presentation"
                >
                    <a
                        href="#"
                        class="nav-link"
                        @click.prevent="switchToList(layer)"
                    >{{ $t(layer.name) }}</a>
                </li>
            </ul>
        </div>
        <template v-if="featureListView === tabStatus.ACTIVE">
            <div
                id="feature-lister-list-header"
                class="panel-heading"
            >
                <span>{{ $t(layer.name) }}</span>
            </div>
            <div
                id="feature-lister-list"
                class="panel panel-default feature-lister-list"
            >
                <div
                    class="table-responsive feature-lister-list-table-container"
                >
                    <TableComponent
                        id="feature-lister-list-table"
                        :data="tableData"
                        :filterable="true"
                        :enable-settings="true"
                        :sortable="true"
                        select-mode="row"
                        :run-select-row-on-mount="false"
                        :run-select-on-hover="true"
                        @rowSelected="row => clickOnFeature(row)"
                        @rowOnHover="row => hoverOverFeature(row)"
                    />
                </div>
                <div
                    class="panel-footer feature-lister-list-footer"
                >
                    <FlatButton
                        id="module-feature-lister-show-more"
                        aria-label="$t('commonmodules.featureLister.more')"
                        type="button"
                        :text="$t('common:modules.featureLister.more')"
                        :icon="'bi-plus'"
                        :disabled="featureCount <= maxFeatures || shownFeatures === featureCount"
                        :interaction="() => showMore()"
                    />
                    <p
                        class="navbar-text feature-lister-list-message"
                    >
                        {{ $t("common:modules.featureLister.key", {shownFeatures, featureCount}) }}
                    </p>
                </div>
            </div>
        </template>
        <template v-if="featureDetailView === tabStatus.ACTIVE">
            <div
                id="feature-lister-details-header"
                class="panel-heading"
            >
                <span> {{ $t("common:modules.featureLister.detailsOfSelected") }} </span>
            </div>
            <div
                id="feature-lister-details"
                class="panel panel-default feature-lister-details"
            >
                <ul
                    v-for="(value, key) in featureDetails"
                    :key="'module-feature-lister-' + key"
                    class="list-group feature-lister-details-ul"
                >
                    <li class="list-group-item feature-lister-details-li">
                        <strong>
                            {{ key }}
                        </strong>
                    </li>
                    <li class="list-group-item feature-lister-details-li">
                        <p v-if="isWebLink(value)">
                            <a
                                :href="value"
                                target="_blank"
                            >{{ value }}</a>
                        </p>
                        <p v-else-if="isPhoneNumber(value)">
                            <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                        </p>
                        <p v-else-if="isEmailAddress(value)">
                            <a :href="`mailto:${value}`">{{ value }}</a>
                        </p>
                        <p
                            v-else-if="typeof value === 'string' && value.includes(';')"
                        >
                            <span v-html="toBold(value, key)" />
                        </p>
                        <p
                            v-else-if="typeof value === 'string' && value.includes('|')"
                        >
                            <span v-html="removeVerticalBar(value)" />
                        </p>
                        <p
                            v-else-if="typeof value === 'string' && value.includes('<br>')"
                        >
                            <span v-html="value" />
                        </p>
                        <p v-else>
                            {{ value }}
                        </p>
                    </li>
                </ul>
            </div>
        </template>
    </div>
</template>


<style lang="scss" scoped>
    @import "~variables";

#featureLister {
    width: fit-content;
    max-width: 90%;
}
.feature-lister-list-table-th {
    cursor: pointer;
    >span {
        float: left;
        width: 15px;
        color: $dark_grey;
    }
    >.feature-lister-list-table-th-sorted {
        color: $black;
    }
}
.feature-lister-list-table-container {
    border-left: 1px solid $light_grey;
    border-right: 1px solid $light_grey;
}
#feature-lister-list-table {
    overflow: auto;
}
.feature-lister-list-button {
    position: relative;
    right: 0;
}
.feature-lister-list-message {
    float: left;
    text-align: center;
    align-items: center;
}
.feature-lister-details-ul {
    max-height: 400px;
    overflow: auto;
    cursor: auto;
}
.feature-lister-list-table-td {
    height: 15px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.feature-lister-list-table-tr {
    cursor: pointer;
}
.feature-lister-details {
    display: block;
    margin-bottom: 0;
    max-height: 100%;
    overflow: auto;
}
.feature-lister-list {
    margin-bottom: 0;
    display: contents;
    overflow: auto;
}
.feature-lister-themes {
    width: 100%;
}
.panel-heading {
    background: $light_grey;
    color: $dark_grey;
    cursor: default;
    border-left: 1px solid $dark_grey;
    border-right: 1px solid $dark_grey;
    padding: 10px 15px;
    border-bottom: 1px solid transparent;
}
#feature-lister-themes-ul {
    .nav-item:hover {
        background-color: $light_grey;
    }
}

</style>
