<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../../store/tsr/gettersTSR";

/**
 * TsrUpload
 * @module modules/TsrUpload
 * @vue-prop {Boolean} csvHeaders - Shows if csvHeaders is on or off
 * @vue-computed {String} dropZoneAdditionalClass - Gets the class for the file drop element
 */
export default {
    name: "TsrUpload",
    props: {
        csvHeaders: Boolean
    },
    emits: ["afterFileValidation"],
    data: function () {
        return {
            tsrWaypoints: [],
            dataIsValid: false,
            dzIsDropHovering: false
        };
    },
    computed: {
        ...mapGetters("Modules/Routing/TSR", Object.keys(getters)),
        ...mapGetters("Modules/Routing", ["taskHandler", "tsrSettings"]),

        /**
         * Gets the class for the file drop element
         * @returns {String} class to display
         */
        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    methods: {
        ...mapMutations("Modules/Routing/TSR", ["IsLoadingTSR"]),
        ...mapMutations("Modules/Routing", ["setTaskHandler"]),
        ...mapActions("Modules/Routing/TSR", ["fetchTSR", "resetTSRResults", "addWaypoint", "findTSR", "zoomAfterUpload"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapActions("Modules/Routing", ["transformCoordinatesWgs84ToLocalProjection", "fetchTextByCoordinates"]),

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
         * Opens file input
         * @returns {void}
         */
        startFileInput () {
            this.$refs.fileInputLabel.click();
        },
        /**
         * Called when files are added by the user to process
         * loading animation is shown while processing and an error is shown to the user if something happens while processing
         * @param {File[]} file to process
         * @returns {void}
         */
        addFiles (file) {
            const isCsv = this.checkFileType(file[0]);

            if (isCsv) {

                const reader = new FileReader();

                // File is always in an array
                reader.readAsText(file[0]);

                reader.onload = async f => {

                    let content = f.target.result;

                    // remove first line if csv headers toggle is active
                    if (this.csvHeaders) {
                        content = f.target.result.substring(f.target.result.indexOf("\n") + 1);
                    }

                    // validate Input
                    await this.validateCsv(content)
                        .catch((error) => {
                            this.dataIsValid = false;
                            this.addSingleAlert({
                                category: "error",
                                title: this.$t("common:modules.routing.tsr.upload.failTitle"),
                                content: this.$t(error)
                            });
                        });
                    // check coordinates for duplicates
                    if (this.dataIsValid) {
                        try {
                            // read result
                            this.tsrWaypoints = this.splitCsv(content);
                            await this.addFileToWaypoints(this.tsrWaypoints).then((csvContainsDuplicate) => {
                                if (!csvContainsDuplicate) {
                                    this.addSingleAlert({
                                        category: "success",
                                        title: this.$t("common:modules.routing.tsr.upload.successTitle"),
                                        content: this.$t("common:modules.routing.tsr.upload.successInfo")
                                    });
                                }
                                else {
                                    this.addSingleAlert({
                                        category: "info",
                                        title: this.$t("common:modules.routing.tsr.upload.successTitle"),
                                        content: this.$t("common:modules.routing.tsr.errors.duplicatePoints")
                                    });
                                }

                                this.zoomAfterUpload();
                            });
                        }
                        catch (e) {
                            this.addSingleAlert({
                                category: "error",
                                title: this.$t("common:modules.routing.tsr.upload.failTitle"),
                                content: e.message
                            });
                        }
                    }
                };
            }
            this.$emit("afterFileValidation");
        },
        /**
         * Split csv file input by line.
         * @param {String} csvFileContent Content of CSV File
         * @returns {Array} Array with lines from csv files
         */
        splitCsv (csvFileContent) {
            // replace carriage return character (char code 13)
            const content = csvFileContent.replace(/[\r]/g, "").trim();

            return content.split("\n");
        },
        /**
         * Get Index of waypoint to be displayed in list.
         * @param {Integer} idx Waypoint index in upload list
         * @param {Array} tsrWaypoints TSR waypoints
         * @returns {String} newIdx new index to be displayed in interface
         */
        getIdx (idx, tsrWaypoints) {
            if (idx === 0) {
                return "S) ";
            }
            else if (idx === tsrWaypoints.length - 1) {
                return "Z) ";
            }
            return `${idx + 1}) `;

        },
        /**
         * Transform points from csv file to ol waypoints and add to waypoints array.
         * @param {Array} csvLines lines from csv file.
         * @returns {void}
         */
        async addFileToWaypoints (csvLines) {
            let isDuplicate = false,
                csvContainsDuplicate = false;

            // get x and y coordinates and transform to float
            for (let line of csvLines) {
                line = line.includes(",") ? line.replaceAll(",", ".") : line;
                const xCoord = parseFloat(line.split(";")[1]),
                    yCoord = parseFloat(line.split(";")[2]),

                    // transform to local projection and add to waypoints
                    tsrGeoSearchResult = await this.fetchTextByCoordinates({coordinates: [xCoord, yCoord]}),

                    // switch lat/long and transform to local projection
                    localCoordinates = await this.transformCoordinatesWgs84ToLocalProjection(
                        tsrGeoSearchResult ? [tsrGeoSearchResult.getCoordinates()[1], tsrGeoSearchResult.getCoordinates()[0]] : [xCoord, yCoord]
                    );

                isDuplicate = await this.waypoints.some(x => {
                    if (x.coordinates[0]) {
                        return x.coordinates[0].toFixed(2) === localCoordinates[0].toFixed(2) && x.coordinates[1].toFixed(2) === localCoordinates[1].toFixed(2);
                    }
                    return false;
                });

                if (!isDuplicate) {
                    // add new waypoint with result from geocoder
                    this.addWaypoint({index: this.waypoints.length,
                        coordinates: localCoordinates,
                        displayName: tsrGeoSearchResult ? tsrGeoSearchResult.getDisplayName() : `${localCoordinates[0]}, ${localCoordinates[1]}`});
                }
                else {
                    csvContainsDuplicate = true;
                }
            }

            return csvContainsDuplicate;
        },
        /**
         * Validates file type
         * @param {Object} file  - File Object to be checked
         * @returns {Boolean} - true if file is csv
         */
        checkFileType (file) {
            // validate file type
            if (file.type !== "text/csv") {
                this.addSingleAlert({
                    category: "error",
                    title: this.$t("common:modules.routing.tsr.upload.failTitle"),
                    content: this.$t("common:modules.routing.tsr.errors.wrongFileType")
                });
                return false;
            }
            return true;
        },
        /**
         * Validation for the csv-file
         * @param {Object} content - Content object to be checked
         * @returns {void}
         */
        validateCsv (content) {

            return new Promise((resolve, reject) => {
                // check if file content is string/file is empty
                if (typeof content !== "string") {
                    reject(new Error(this.$t("common:modules.routing.tsr.errors.errorNoEntries")));
                    return;

                }
                // return error message if there are no entries
                if (content.length === 0) {
                    reject(new Error(this.$t("common:modules.routing.tsr.errors.errorNoEntries")));
                    return;

                }
                //  check limit for TSR
                if (this.splitCsv(content).length > this.settings.tsrPointLimit) {
                    reject(new Error(this.$t("common:modules.routing.tsr.errors.errorToManyEntriesInFile", {limit: this.settings.tsrPointLimit})));
                    return;
                }

                const lines = this.splitCsv(content);

                lines.forEach((line, i) => {
                    let lineParts = line.split(";");

                    // check if file contains empty lines
                    if (line.length === 0) {
                        reject(new Error(this.$t("common:modules.routing.tsr.errors.emptyRow")));
                        return;
                    }
                    // check if each line has correct amount of attributes
                    if (lineParts.length !== 3) {
                        reject(new Error(this.$t("common:modules.routing.tsr.errors.wrongNEntriesInRow", {row: i + 1})));
                        return;
                    }
                    // check if any line contains empty fields or is too long
                    lineParts.forEach((attribute) => {
                        if (attribute.length === 0) {
                            reject(new Error(this.$t("common:modules.routing.tsr.errors.emptyEntriesInRow", {row: i + 1})));
                            return;
                        }
                        if (attribute.length > 25) {
                            reject(new Error(this.$t("common:modules.routing.tsr.errors.attributeTooLong", {row: i + 1})));

                        }
                    });

                    lineParts = lineParts.map((col) => col.replaceAll(",", "."));

                    // check if coordinates are numbers
                    if (!this.isNumber(Number(lineParts[1])) || !this.isNumber(Number(lineParts[2]))) {
                        reject(new Error(this.$t("common:modules.routing.tsr.errors.rowContainsEntriesNoNumber", {row: i + 1})));
                    }
                    // check coordinate range
                    if (lineParts[1] < -180 || lineParts[1] > 180 || lineParts[2] < -90 || lineParts[2] > 90) {
                        reject(new Error(this.$t("common:modules.routing.tsr.errors.invalidCoordinateRange", {row: i + 1})));
                    }
                });

                resolve(this.dataIsValid = true);
            }
            );
        },
        /**
        * Checks if input is a number
        * @param {*} num to check
        * @returns {Boolean} true if number
        */
        isNumber (num) {
            return !isNaN(num) && typeof num === "number";
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
    <div class="d-flex justify-content-center">
        <div
            class="vh-center-outer-wrapper drop-area-fake mb-2"
            :class="dropZoneAdditionalClass"
        >
            <div
                class="vh-center-inner-wrapper"
            >
                <p
                    class="caption"
                >
                    {{ $t('common:modules.routing.batchProcessing.placeFile') }}
                </p>
            </div>

            <div
                class="drop-area"
                role="presentation"
                @drop.prevent="onDrop($event)"
                @dragover.prevent
                @dragenter.prevent="onDZDragenter()"
                @dragleave="onDZDragend()"
            />
        </div>
    </div>
    <div class="divider">
        {{ $t('common:modules.routing.tsr.upload.divider') }}
    </div>
    <div class="d-flex justify-content-center">
        <button
            id="btn-file-input"
            class="btn btn-primary"
            type="button"
            @click="startFileInput()"
        >
            <i class="bi bi-upload" />
            {{ $t('common:modules.routing.tsr.upload.header') }}
        </button>
    </div>

    <label
        ref="fileInputLabel"
        class="d-none mt-2 mb-2 col-md-12"
    >
        <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="onInputChange($event)"
        >

    </label>
</template>

<style lang="scss" scoped>
@import "~variables";

.drop-area-fake {
    background-color: $white;
    border-radius: 12px;
    border: 2px dashed $accent_disabled;
    padding:24px;
    transition: background 0.25s, border-color 0.25s;
    min-width: 80%;

    &.dzReady {
        background-color:$accent_hover;
        border-color:transparent;
        p.caption {
            color: $white;
        }
    }

    p.caption {
        margin:0;
        text-align:center;
        transition: color 0.35s;
        font-family: $font_family_accent;
        font-size: $font-size-lg;
        color: $accent_disabled;
    }
}

.drop-area {
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    z-index:10;
}

.vh-center-outer-wrapper {
    top:0;
    left:0;
    right:0;
    bottom:0;
    text-align:center;
    position:relative;
    &:before {
        content:'';
        display:inline-block;
        height:100%;
        vertical-align:middle;
        margin-right:-0.25rem;
    }
}

.vh-center-inner-wrapper {
    text-align:left;
    display:inline-block;
    vertical-align:middle;
    position:relative;
}

.divider {
  display: flex;
  align-items: center;
}

.divider::before, .divider::after {
  content: '';
  height: 1px;
  background-color: silver;
  flex-grow: 1;
  margin: 20px;
}
</style>
