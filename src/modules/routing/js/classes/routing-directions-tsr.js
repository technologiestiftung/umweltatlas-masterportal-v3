/**
 * @description Abstracts the routing directions of external services.
 * @class RoutingTSRDirections
 */
class RoutingTSRDirections {
    /**
     * creates new RoutingDirections
     * @param {Array<{Number, Number, Number, Number}>} bbox of the route.
     * @param {Number} distance of the route in meter.
     * @param {Number} duration of the route in seconds.
     * @param {Array<{Number, Number}>} lineString of the route.
     * @param {Array<Number>} lineStringWaypointIndex to find out where the waypoints on the linestring are.
     */
    constructor ({
        distance,
        duration,
        lineString,
        lineStringWaypointIndex,
        steps,
        elevationProfile
    }) {
        this.distance = distance;
        this.duration = duration;
        this.lineString = lineString;
        this.lineStringWaypointIndex = lineStringWaypointIndex;
        this.segments = [];
        this.steps = steps;
        this.elevationProfile = elevationProfile;
    }

    /**
     * Distance of the route in meter.
     * @returns {Number} distance of the route in meter.
     */
    getDistanceMeter () {
        return this.distance;
    }

    /**
     * Duration of the route in seconds.
     * @returns {Number} duration of the route in seconds.
     */
    getDurationSeconds () {
        return this.duration;
    }

    /**
     * LineString of the route
     * @returns {Array<{Number, Number}>} lineString of the route
     */
    getLineString () {
        return this.lineString;
    }
}

export {RoutingTSRDirections};

