<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";

export default {
    name: "EntityModelView",
    data () {
        return {
            increment: true,
            coordType: "",
            rotationClickValue: 5,
            rotationDropdownValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        /**
         * The rotation angle of the entity.
         * @type {number}
         * @name rotationAngle
         * @memberof EntityModelView
         * @vue-computed
         * @vue-prop {number} rotation - The current rotation angle.
         * @vue-propsetter {number} rotation - Sets the rotation angle, clamping it between -180 and 180 degrees.
         */
        rotationAngle: {
            get () {
                return this.rotation;
            },
            set (value) {
                let adjustedValue = value;

                if (value < -180) {
                    adjustedValue = -180;
                }
                else if (value > 180) {
                    adjustedValue = 180;
                }
                this.setRotation(adjustedValue);
            }
        },
        coordAdjusted () {
            if (this.currentProjection.epsg !== "EPSG:4326" || this.coordType === "height") {
                return this.increment ? 0.1 : -0.1;
            }
            return this.increment ? 0.000001 : -0.000001;
        },
        coordShiftAdjusted () {
            if (this.currentProjection.epsg !== "EPSG:4326" || this.coordType === "height") {
                return this.increment ? 1 : -1;
            }
            return this.increment ? 0.00001 : -0.00001;
        }
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        /**
         * Called if selection of projection changed. Sets the current projection to state and updates the UI.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            if (event.target.value) {
                this.newProjectionSelected(event.target.value);
            }
        },
        /**
         * Handles the change event of the "Adapt to Height" checkbox.
         * Updates the adaptToHeight state and triggers the entity position update if the checkbox is checked.
         * @param {boolean} value - The new value of the checkbox.
         * @returns {void}
         */
        checkedAdapt (value) {
            this.setAdaptToHeight(value);

            if (value) {
                this.updateEntityPosition();
            }
        },
        /**
         * Increments or decrements the value of a coordinate and updates the entity position.
         * @param {string} type - The coordinate to adjust ("easting", "northing", or "height").
         * @param {string} increment - If the value should be incremented or not (decrement).
         * @param {string} shift - If the shift modifier is active.
         * @returns {void}
         */
        adjustCoordinate (type, increment, shift = false) {
            let coordinate;

            this.increment = increment;
            this.type = type;

            if (type === "easting") {
                coordinate = this.coordinatesEasting.value;
            }
            else if (type === "northing") {
                coordinate = this.coordinatesNorthing.value;
            }
            else if (type === "height") {
                coordinate = this.height.value;
            }

            if (shift) {
                coordinate = parseFloat(coordinate) + this.coordShiftAdjusted;
            }
            else {
                coordinate = parseFloat(coordinate) + this.coordAdjusted;
            }

            if (this.currentProjection.epsg === "EPSG:4326" && type !== "height") {
                coordinate = coordinate.toFixed(6) + "°";
            }
            else {
                coordinate = coordinate.toFixed(2);
            }

            if (type === "easting") {
                this.coordinatesEasting.value = coordinate;
            }
            else if (type === "northing") {
                this.coordinatesNorthing.value = coordinate;
            }
            else if (type === "height") {
                this.height.value = coordinate;
            }

            this.updateEntityPosition();
        },
        /**
         * Rotates the current model based on the value of the rotationAngle property.
         * Updates the heading of the model and sets its orientation using the calculated quaternion.
         * @returns {void}
         */
        rotate () {
            const entities = this.entities,
                entity = entities.getById(this.currentModelId),
                heading = Cesium.Math.toRadians(parseInt(this.rotationAngle, 10)),
                modelFromState = this.importedModels.find(model => model.id === this.currentModelId),
                orientationMatrix = Cesium.Transforms.headingPitchRollQuaternion(
                    entity.position.getValue(),
                    new Cesium.HeadingPitchRoll(heading, 0, 0)
                );

            modelFromState.heading = parseInt(this.rotationAngle, 10);
            entity.orientation = orientationMatrix;
        },
        /**
         * Decrements the rotationAngle property by the value of rotationClickValue.
         * Updates the rotationAngle property and calls the rotate method to apply the rotation.
         * @returns {void}
         */
        decrementAngle () {
            const newRotationAngle = parseInt(this.rotationAngle, 10) - parseInt(this.rotationClickValue, 10);

            this.rotationAngle = Math.max(newRotationAngle, -180);
            this.rotate();
        },
        /**
         * Increments the rotationAngle property by the value of rotationClickValue.
         * Updates the rotationAngle property and calls the rotate method to apply the rotation.
         * @returns {void}
         */
        incrementAngle () {
            const newRotationAngle = parseInt(this.rotationAngle, 10) + parseInt(this.rotationClickValue, 10);

            this.rotationAngle = Math.min(newRotationAngle, 180);
            this.rotate();
        }
    }
};
</script>

<template lang="html">
    <div id="modeler3D-entity-view">
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.entity.captions.editInfo')"
        />
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.entity.captions.pickupPlace')"
        />
        <p
            v-if="currentProjection.id === 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
            class="cta red"
            v-html="$t('modules.tools.modeler3D.entity.captions.projectionInfo')"
        />
        <div class="h-seperator" />
        <div class="form-group form-group-sm row">
            <label
                class="col-md-5 col-form-label"
                for="model-name"
            >
                {{ $t("modules.tools.modeler3D.entity.captions.modelName") }}
            </label>
            <div class="col-md-7">
                <input
                    id="model-name"
                    class="form-control form-control-sm"
                    type="text"
                    :value="getModelNameById(currentModelId)"
                    @input="setModelName($event.target.value)"
                >
            </div>
        </div>
        <div class="h-seperator" />
        <div class="form-group form-group-sm row">
            <label
                class="col-md-5 col-form-label"
                for="tool-edit-projection"
            >
                {{ $t("modules.tools.modeler3D.entity.projections.projection") }}
            </label>
            <div class="col-md-7">
                <select
                    class="form-select form-select-sm"
                    aria-label="currentProjection"
                    @change="selectionChanged($event)"
                >
                    <option
                        v-for="(projection, i) in projections"
                        :key="i"
                        :value="projection.id"
                        :SELECTED="projection.id === currentProjection.id"
                    >
                        {{ projection.title ? projection.title : projection.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="h-seperator" />
        <div>
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-5 col-form-label"
                    for="eastingField"
                >
                    {{ $t(getLabel("eastingLabel")) }}
                </label>
                <div class="col-md-7 position-control">
                    <input
                        id="eastingField"
                        v-model="coordinatesEasting.value"
                        class="form-control form-control-sm position-input"
                        type="text"
                        @input="updateEntityPosition"
                    >
                    <div
                        v-if="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                    >
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('easting', true)"
                            @click.shift="adjustCoordinate('easting', true, true)"
                        >
                            <i
                                class="bi bi-arrow-up"
                            />
                        </button>
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('easting', false)"
                            @click.shift="adjustCoordinate('easting', false, true)"
                        >
                            <i
                                class="bi bi-arrow-down"
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-5 col-form-label"
                    for="northingField"
                >
                    {{ $t(getLabel("northingLabel")) }}
                </label>
                <div class="col-md-7 position-control">
                    <input
                        id="northingField"
                        v-model="coordinatesNorthing.value"
                        class="form-control form-control-sm position-input"
                        type="text"
                        @input="updateEntityPosition"
                    >
                    <div
                        v-if="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                    >
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('northing', true)"
                            @click.shift="adjustCoordinate('northing', true, true)"
                        >
                            <i
                                class="bi bi-arrow-up"
                            />
                        </button>
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('northing', false)"
                            @click.shift="adjustCoordinate('northing', false, true)"
                        >
                            <i
                                class="bi bi-arrow-down"
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div class="row">
                <label
                    class="col-md-5 col-form-label"
                    for="heightField"
                >
                    {{ $t("modules.tools.modeler3D.entity.projections.height") }}
                </label>
                <div class="col-md-7 position-control">
                    <input
                        id="heightField"
                        v-model="height.value"
                        class="form-control form-control-sm position-input"
                        type="text"
                        :disabled="adaptToHeight"
                        @input="updateEntityPosition"
                    >
                    <div v-if="!adaptToHeight">
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('height', true)"
                            @click.shift="adjustCoordinate('height', true, true)"
                        >
                            <i
                                class="bi bi-arrow-up"
                            />
                        </button>
                        <button
                            class="btn btn-primary btn-sm btn-pos"
                            :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                            @click.exact="adjustCoordinate('height', false)"
                            @click.shift="adjustCoordinate('height', false, true)"
                        >
                            <i
                                class="bi bi-arrow-down"
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="col-md-5" />
                <label
                    class="col-md-5 col-form-label"
                    for="adaptHeightCheck"
                >
                    {{ $t("modules.tools.modeler3D.entity.projections.adaptToHeight") }}
                </label>
                <input
                    id="adaptHeightCheck"
                    class="form-check-input check-height"
                    type="checkbox"
                    :checked="adaptToHeight"
                    @change="checkedAdapt($event.target.checked)"
                >
            </div>
        </div>
        <div class="h-seperator" />
        <div>
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-8 col-form-label"
                    for="tool-edit-rotation"
                >
                    {{ $t("modules.tools.modeler3D.entity.projections.rotation") }}
                </label>
                <div class="col-md-3">
                    <input
                        id="tool-edit-rotation"
                        v-model="rotationAngle"
                        class="form-control form-control-sm"
                        type="text"
                        @input="rotate"
                    >
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="position-control">
                    <button
                        class="btn btn-primary btn-sm"
                        @click="decrementAngle"
                    >
                        <i
                            class="bi bi-arrow-left"
                        />
                    </button>
                    <input
                        id="tool-edit-rotation-slider"
                        v-model="rotationAngle"
                        aria-label="rotationSlider"
                        class="font-arial form-range"
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        @input="rotate"
                    >
                    <button
                        class="btn btn-primary btn-sm"
                        @click="incrementAngle"
                    >
                        <i
                            class="bi bi-arrow-right"
                        />
                    </button>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-7 col-form-label"
                    for="tool-edit-rotation-switch"
                >
                    {{ $t("modules.tools.modeler3D.entity.projections.rotationSwitch") }}
                </label>
                <div class="col-md-4">
                    <select
                        v-model="rotationClickValue"
                        class="form-select form-select-sm"
                        aria-label="rotationClickValue"
                    >
                        <option
                            v-for="value in rotationDropdownValues"
                            :key="value"
                            :value="value"
                        >
                            {{ value }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        <div class="h-seperator" />
        <div class="row justify-content-between">
            <button
                id="tool-import3d-deactivateEditing"
                class="col-5 btn btn-primary btn-sm primary-button-wrapper"
                @click="setCurrentModelId(null)"
            >
                {{ $t("modules.tools.modeler3D.entity.captions.backToList") }}
            </button>
            <button
                id="tool-import3d-deleteEntity"
                class="col-5 btn btn-danger btn-sm delete-button-wrapper"
                @click="confirmDeletion(currentModelId)"
            >
                {{ $t("modules.tools.modeler3D.entity.captions.delete") }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .delete-button-wrapper {
        color: $white;
        background-color: $light_red;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            opacity: 1;
            &.btn-select, &:active, &.active, &:checked, &::selection, &.show, &[aria-expanded="true"] {
                background-color: $light_red;
                border-radius: .25rem;
            }
            background-color: lighten($light_red, 10%);
            color: $light_grey_contrast;
            cursor: pointer;
        }
    }

    .cta {
        margin-bottom:12px;
    }

    .red {
        color: red;
    }

    .position-control {
        display: flex;
        gap: 0.25em;
    }

    .position-input {
        height: 3.8em;
    }

    .check-height {
        width: 1.5em;
        height: 1.5em;

        margin: 0;
    }

    .btn-margin {
        margin-top: 1em;
    }

    .btn-pos {
        padding: 0.25em;
    }

    .row {
        align-items: center;
    }

    .btn-primary {
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
        &:active {
            transform: scale(0.98);
        }
    }
</style>
