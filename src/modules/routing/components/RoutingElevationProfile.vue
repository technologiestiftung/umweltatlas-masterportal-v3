<script>
import getters from "../store/directions/gettersDirections";
import {mapGetters} from "vuex";
import {Chart} from "chart.js";
import {toRaw} from "vue";

export default {
    name: "RoutingElevationProfile",
    data () {
        return {
            collapseProfile: false,
            distances: [],
            elevations: [],
            ascent: "",
            descent: ""
        };
    },
    computed: {
        ...mapGetters("Modules/Routing/Directions", Object.keys(getters)),
        ...mapGetters("Modules/Routing", ["directionsSettings"])
    },
    mounted () {
        // extract distances data (x-axis)
        this.distances = this.routingDirections.elevationProfile.data.map((x) => x[0]);

        // extract elevation data (y-axis)
        this.elevations = this.routingDirections.elevationProfile.data.map((x) => x[1]);

        // extract ascent and descent vaulues of elevation profile
        this.ascent = Math.round(this.routingDirections.elevationProfile.ascent).toLocaleString();
        this.descent = Math.round(this.routingDirections.elevationProfile.descent).toLocaleString();


        const canvas = document.getElementById("elevation-profile");

        this.drawChart(canvas);

        // add event listener - if leaving elevation profile with mouse, remove point on map
        canvas.addEventListener("mouseleave", () => {
            const source = toRaw(this.directionsElevationSource);

            source.getFeatures()[0].getGeometry().setCoordinates([]);
        });
    },
    methods: {
        /**
         * Draws chart in canvas
         * @param {Object} canvas element to draw chart inside
         * @returns {void}
         */
        drawChart (canvas) {
            // create chart for elevation profile
            new Chart(canvas, {
                type: "line",
                data: {
                    labels: this.distances,
                    datasets: [{
                        data: this.elevations,
                        borderWidth: 2,
                        borderColor: this.directionsSettings.styleElevationProfile.profileColor,
                        backgroundColor: this.directionsSettings.styleElevationProfile.profileFillColor,
                        pointStyle: false,
                        fill: true,
                        cubicInterpolationMode: "monotone"
                    }]
                },
                options: {
                    interaction: {
                        intersect: false,
                        mode: "index"
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: this.$t("common:modules.routing.elevationProfile.yAxis")
                            }
                        },
                        x: {
                            display: false,
                            title: {
                                display: true,
                                text: this.$t("common:modules.routing.elevationProfile.xAxis")
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: this.$t("common:modules.routing.elevationProfile.titleChart")
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: this.labelToolTip,
                                title: this.titleToolTip
                            }
                        }
                    },
                    onHover: this.onHover
                },
                plugins: [{
                    afterDraw: this.drawVerticalLine
                }]
            });
        },

        /**
         * Returns the height for the tooltip
         * @param {Object} context of the mouseover
         * @returns {String} height
         */
        labelToolTip (context) {
            return `${context.parsed.y} m`;
        },

        /**
         * Returns the distance for the tooltip
         * @param {Object} context of the mouseover
         * @returns {String} distance
         */
        titleToolTip (context) {
            const currentDistance = Number(context[0].label);

            if (currentDistance < 1000) {
                return this.$t("common:modules.routing.elevationProfile.titleTooltipMeters", {distance: currentDistance.toFixed(2)});
            }

            return this.$t("common:modules.routing.elevationProfile.titleTooltipKilometers", {distance: (currentDistance / 1000).toFixed(2)});
        },

        /**
         * Shows current point on map while hovering over elevation profile
         * @param {Object} e chart event
         * @param {Object} hoverData information of mouse hover data
         * @returns {void}
         */
        onHover (e, hoverData) {
            const source = toRaw(this.directionsElevationSource);

            // add current elevation point in route while hovering over corresponding data
            if (hoverData.length) {
                const index = hoverData[0].index,
                    point = toRaw(this.routingDirections.lineString[index]);

                source.getFeatures()[0].getGeometry().setCoordinates(point);
            }
        },

        /**
         * Draws a vertical line in chart on cursor position
         * @param {Object} chart chart object
         * @returns {void}
         */
        drawVerticalLine (chart) {
            if (chart.tooltip?._active?.length) {
                const x = chart.tooltip._active[0].element.x,
                    yAxis = chart.scales.y,
                    ctx = chart.ctx;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom);
                ctx.lineWidth = 1;
                ctx.strokeStyle = this.directionsSettings.styleElevationProfile.elevationPointLineColor;
                ctx.stroke();
                ctx.restore();
            }
        },
        /**
         * Controls collapsing of chart
         * @returns {void}
         */
        collapse () {
            if (!this.collapseProfile) {
                document.getElementById("elevation-profile").style.display = "none";
                document.getElementById("ascent-descent-data").style.display = "none";
            }
            else {
                document.getElementById("elevation-profile").style.display = "block";
                document.getElementById("ascent-descent-data").style.display = "block";
            }

            this.collapseProfile = !this.collapseProfile;
        }
    }
};
</script>

<template>
    <button
        class="d-flex btn-icon"
        @click="collapse()"
    >
        <i
            :class="collapseProfile? 'bi-chevron-right' : 'bi-chevron-down'"
        />
        <b>{{ $t('common:modules.routing.elevationProfile.titleCollapse') }}</b>
    </button>
    <div>
        <canvas id="elevation-profile" />
    </div>
    <div
        id="ascent-descent-data"
    >
        <div class="d-flex justify-content-around">
            <span>
                <i class="bi bi-arrow-up" />
                {{ ascent }} m
            </span>
            <span>
                <i class="bi bi-arrow-down" />
                {{ descent }} m
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.btn-icon {
    background-color: $white;
    border: none;
    width: 100%;
    justify-content: flex-start;
    padding: 5px 0;
}
</style>
