<script>
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../shared/modules/inputs/components/FileUpload.vue";
/**
 * Routing Batch Processing
 * @module modules/routing/components/RoutingBatchProcessing
 * @vue-prop {Object} settings - The settings for the element.
 * @vue-prop {Number} progress - The progress for the progress bar.
 * @vue-prop {Boolean} isProcessing - Shows if processing is active.
 * @vue-prop {String} structureText - The structure text.
 * @vue-prop {String} exampleText - The example text.
 *
 * @vue-data {Boolean} dzIsDropHovering - Shows if hovering over the dropzone is active.
 *
 * @vue-computed {String} dropZoneAdditionalClass - The additional class for the drop zone.
 *
 * @vue-event {String} cancelProcess - Emits function to cancel the process.
 * @vue-event {File[]} filesadded - Emits function to add files.
 */
export default {
    name: "RoutingBatchProcessing",
    components: {
        IconButton,
        FileUpload
    },
    props: {
        settings: {
            type: Object,
            required: true
        },
        progress: {
            type: Number,
            required: true
        },
        isProcessing: {
            type: Boolean,
            required: true
        },
        structureText: {
            type: String,
            required: true
        },
        exampleText: {
            type: String,
            required: true
        }
    },
    emits: ["cancelProcess", "filesadded"],
    data () {
        return {
            dzIsDropHovering: false,
            fileUploaded: false,
            uploadedFiles: []
        };
    },
    computed: {
        /**
         * Gets the class for the file drop element
         * @returns {String} class to display
         */
        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    watch: {
        /**
         * Resets the HTML File input after it has been read
         * @param {Boolean} newVal isProcessing
         * @returns {void}
         */
        isProcessing: function (newVal) {
            if (newVal) {
                this.$refs.fileInput.value = "";
            }
        }
    },
    methods: {
        /**
         * Called when user uploads a file to process
         * @param {HTMLInputEvent} e event with the files
         * @returns {void}
         */
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFiles(e.target.files);
            }
        },
        /**
         * Called internally to emit the files to process
         * @param {File[]} files to emit
         * @returns {void}
         */
        addFiles (files) {
            this.$emit("filesadded", files);
        },
        /**
         * Called to open the file select dialog in the browser
         * @returns {void}
         */
        startFileInput () {
            this.$refs.fileInputLabel.click();
        },
        /**
         * Called when user starts dragging a file over the upload container
         * @returns {void}
         */
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        /**
         * Called when user stops dragging a file over the upload container
         * @returns {void}
         */
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        /**
         * Called when user drops a file in the upload container
         * @param {HTMLInputEvent} e event with the files
         * @returns {void}
         */
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.addFiles(e.dataTransfer.files);
            }
        }
    }
};
</script>

<template>
    <div id="routing-batch-processing">
        <div
            v-if="isProcessing"
            id="routing-batch-processing-isprocessing"
            class="d-flex flex-column"
        >
            <span>{{ $t('common:modules.routing.batchProcessing.isProcessing') }}</span>
            <div class="d-flex">
                <progress
                    class="col-8"
                    max="100"
                    :value="progress"
                />
                <span
                    id="routing-batch-processing-isprocessing-progresstext"
                    class="col-3"
                >{{ progress }} %</span>
                <IconButton
                    :aria="$t('common:modules.routing.batchProcessing.cancel')"
                    :class-array="['btn-light']"
                    :icon="'bi-x'"
                    :interaction="() => $emit('cancelProcess')"
                />
            </div>
        </div>


        <FileUpload
            :id="'fileUpload'"
            :keydown="(e) => triggerClickOnFileInput(e)"
            :change="(e) => onInputChange(e)"
            :drop="(e) => onDrop(e)"
        />
        <label
            ref="fileInputLabel"
            class="d-none"
        >
            <input
                ref="fileInput"
                type="file"
                accept=".csv"
                @change="onInputChange($event)"
            >

        </label>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

</style>
