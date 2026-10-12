<script>
/**
 * The Umweltatlas page of a dataset, shown in an iframe inside an accordion of the layer
 * information. All of the state and the trimming of the framed page stays in
 * LayerInformation.
 * @module modules/layerInformation/components/LayerInfoFrame
 * @vue-prop {String} src - The page to load.
 * @vue-prop {String} externalUrl - The original berlin.de url, for the fallback link.
 * @vue-prop {String} title - Title of the iframe.
 * @vue-prop {Boolean} blocked - Whether berlin.de refused to be framed.
 * @vue-prop {Boolean} ready - Whether the page is loaded and trimmed and may be shown.
 * @vue-prop {Object[]} navigationItems - Links to the other pages of the dataset.
 * @vue-event {Event} load - The iframe finished loading.
 * @vue-event {String} navigate - A navigation item was clicked.
 */
export default {
    name: "LayerInfoFrame",
    props: {
        src: {
            type: String,
            default: ""
        },
        externalUrl: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        },
        blocked: {
            type: Boolean,
            default: false
        },
        ready: {
            type: Boolean,
            default: false
        },
        navigationItems: {
            type: Array,
            default: () => []
        }
    },
    emits: ["load", "navigate"]
};
</script>

<template lang="html">
    <div class="ua-layer-info-frame">
        <div
            v-if="blocked"
            class="ua-layer-info-frame-fallback"
        >
            <p>
                {{ $t("common:modules.layerInformation.uaInfoFrameBlocked") }}
            </p>
            <p class="mb-0">
                <a
                    :href="externalUrl"
                    target="_blank"
                    rel="noopener"
                >
                    {{ $t("common:modules.layerInformation.uaInfoFrameOpenInNewTab") }}
                </a>
            </p>
        </div>
        <nav
            v-if="!blocked && navigationItems.length"
            class="ua-layer-info-frame-nav"
            :aria-label="$t('common:modules.layerInformation.uaInfoFrameNavigation')"
        >
            <button
                v-for="item in navigationItems"
                :key="item.href"
                type="button"
                class="ua-layer-info-frame-nav-item"
                :class="{active: item.href === src}"
                :aria-current="item.href === src ? 'page' : null"
                @click="$emit('navigate', item.href)"
            >
                {{ item.label }}
            </button>
        </nav>
        <div
            v-show="!blocked"
            class="ua-layer-info-frame-body"
        >
            <div
                v-if="!ready"
                class="ua-layer-info-frame-loading"
            >
                {{ $t("common:modules.layerInformation.uaInfoFrameLoading") }}
            </div>
            <iframe
                :src="src"
                :title="title"
                class="ua-layer-info-iframe"
                :class="{'ua-layer-info-iframe-loading': !ready}"
                referrerpolicy="no-referrer-when-downgrade"
                @load="$emit('load', $event)"
            />
        </div>
    </div>
</template>
