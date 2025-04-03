<script>
import {mapActions} from "vuex";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";


/**
 * Wfs Transaction
 * @module modules/WfsTransaction
 */
export default {
    name: "SelectTypeButtons",
    components: {IconButton},
    props: {
        selectTypes: {
            type: Array,
            default: () => ["select", "box", "pen"]
        },
        selectIcons: {
            type: Object,
            default: () => ({
                select: "fa-mouse-pointer",
                box: "fa-vector-square",
                pen: "fa-pen"
            })
        }
    },
    data () {
        return {
            selectedSelectInteraction: "select",
            previousSelectType: null
        };
    },
    methods: {
        ...mapActions("Modules/Wfst", ["handleLassoInteraction", "handleBoxInteraction", "handleClickInteraction"]),
        /**
         * Regulate the select interactions.
         * @param {String} selectType The current select.
         * @returns {void}
         */
        selectSelectInteraction (selectType, key) {
            this.previousSelectType = this.selectedSelectInteraction;

            if (this.previousSelectType === selectType) {
                this.selectedSelectInteraction = "select";
            }
            else {
                this.selectedSelectInteraction = selectType;
            }

            this.updateInteractions(key);
        },
        updateInteractions () {
            if (this.selectedSelectInteraction === "box") {
                this.handleBoxInteraction();
            }
            else if (this.selectedSelectInteraction === "pen") {
                this.handleLassoInteraction();
            }
            else {
                this.handleClickInteraction();
            }
        }
    }
};
</script>

<template lang="html">
    <IconButton
        v-for="(selectType, key) in selectTypes"
        :id="'select-' + selectType"
        :key="key"
        :aria="selectedSelectInteraction === selectType ? $t('common:modules.wfst.multiUpdate.buttonIcon.active.' + selectType) : $t('common:modules.wfst.multiUpdate.buttonIcon.notActive.' + selectType)"
        :class-array="[
            'btn-primary',
            'me-3',
            selectedSelectInteraction === selectType ? 'active': '',
        ]"
        :interaction="() => selectSelectInteraction(selectType, key)"
        :icon="selectIcons[selectType]"
    />
</template>

<style lang="scss" scoped>
@import "~variables";

</style>
