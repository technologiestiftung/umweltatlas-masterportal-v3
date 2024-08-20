<script>
import {mapGetters} from "vuex";
import {generateDarkToLightRange, generateColorRange} from "../../../shared/js/utils/generateColorRange";
import ColorPicker from "../../../shared/modules/inputs/components/ColorPicker.vue";


export default {
    name: "AttributeStyler",
    components: {
        ColorPicker
    },
    data () {
        return {
            colorSetter: false
        };
    },
    computed: {
        layerAttributes () {
            return this.layer;
        }
    },
    methods: {
        test (color) {
            const colorRange = generateDarkToLightRange(color, 5),
                colorRange2 = generateColorRange(color, 5);
            console.log(colorRange)
            console.log(colorRange2)
            console.log(this.layer)
        },
        toggleColorSetter () {
            this.colorSetter = !this.colorSetter;
        }
    }
};

</script>

<template>
    <div>
        <label
            id="attribute-styler-color-setter-label"
            for="attribute-styler-color-setter"
        >
            <input
                id="attribute-styler-color-setter"
                :value="colorSetter"
                type="checkbox"
                @click="toggleColorSetter"
            >
            {{ $t("common:modules.fileImport.colorPerAttributes") }}
        </label>
        <ColorPicker
            v-if="colorSetter"
            @color-changed="test($event)"
        />
    </div>
</template>

