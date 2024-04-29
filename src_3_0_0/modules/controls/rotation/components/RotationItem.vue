<script>
import {mapGetters, mapMutations} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * Control to display current map rotation.
 * @module modules/controls/rotation/components/RotationItem
 */
export default {
    name: "RotationItem",
    components: {
        ControlIcon
    },
    computed: {
        ...mapGetters("Controls/Rotation", ["rotation", "resetRotationIcon", "rotateClockwiseIcon", "rotateCounterClockwiseIcon", "rotationIcons", "showAlways"]),
        ...mapGetters(["controlsConfig"])
    },
    mounted () {
        if (this.controlsConfig?.rotation?.showAlways) {
            this.setShowAlways(this.controlsConfig.rotation.showAlways);
        }
        this.$nextTick(() => {
            mapCollection.getMapView("2D").on("change:rotation", this.updateResetRotationIcon);
        });
    },
    methods: {
        ...mapMutations("Controls/Rotation", ["setRotation", "setRotationIcons", "setShowAlways"]),
        /**
         * Updates the rotation of the control icon.
         * @param {Event} event the mapView rotation event.
         * @returns {void}
         */
        updateResetRotationIcon (event) {
            this.setRotation(event.target.getRotation());
            if (this.$el.querySelector && this.$el.querySelector("i")) {
                this.$el.querySelector("i").style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad)`;
            }
        },
        /**
         * Rotates the map view clockwise for 45 degrees in radians and sets the new rotation.
         * @returns {void}
         */
        rotateClockwise () {
            let newRotation;

            if (this.rotation < this.degreesToRadians(0) && this.rotation > -1 * (this.degreesToRadians(45) + 0.1)) {
                newRotation = 0;
            }
            else {
                newRotation = this.rotation + this.degreesToRadians(45);
            }


            this.setRotation(newRotation);
            mapCollection.getMapView("2D").animate({rotation: this.rotation});
        },
        /**
         * Rotates the map view counterclockwise for 45 degrees in radians and sets the new rotation.
         * @returns {void}
         */
        rotateCounterClockwise () {
            let newRotation;

            if (this.rotation > this.degreesToRadians(0) && this.rotation < this.degreesToRadians(45) + 0.1) {
                newRotation = 0;
            }
            else {
                newRotation = this.rotation - this.degreesToRadians(45);
            }
            this.setRotation(newRotation);
            mapCollection.getMapView("2D").animate({rotation: this.rotation});
        },
        /**
         * Degrees to radiant.
         * @param {Number} degrees the degrees to convert
         * @returns {Number} radiants
         */
        degreesToRadians (degrees) {
            return degrees * (Math.PI / 180);
        },
        /**
         * Radiant to Degrees.
         * @param {Number} rad the radiants to convert
         * @returns {Number} degrees
         */
        radiansToDegrees (rad) {
            return rad * (180 / Math.PI);
        },
        /**
         * Set the mapView to north.
         * @returns {void}
         */
        setToNorth () {
            mapCollection.getMapView("2D").animate({rotation: 0});
        }
    }
};
</script>

<template>
    <div
        id="rotation-control"
    >
        <ControlIcon
            v-if="rotation !== 0 || showAlways"
            id="reset-rotation"
            class="reset-rotation-control-icon"
            :icon-name="resetRotationIcon"
            :title="$t(`common:modules.controls.rotation.reset`)"
            :disabled="false"
            :on-click="setToNorth"
        />
        <ControlIcon
            v-if="rotationIcons"
            id="rotate-clockwise"
            class="rotate-clockwise-icon"
            :title="$t('common:modules.controls.rotation.rotateClockwise')"
            :icon-name="rotateClockwiseIcon"
            :on-click="rotateClockwise"
        />
        <ControlIcon
            v-if="rotationIcons"
            id="rotate-counter-clockwise"
            class="rotate-counter-clockwise-icon"
            :title="$t('common:modules.controls.rotation.rotateCounterClockwise')"
            :icon-name="rotateCounterClockwiseIcon"
            :on-click="rotateCounterClockwise"
        />
    </div>
</template>

<style lang="scss" scoped>
.reset-rotation-control-icon{
    transform: rotate(-45deg);
}
</style>
