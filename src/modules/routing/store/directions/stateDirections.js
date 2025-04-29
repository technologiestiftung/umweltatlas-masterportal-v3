import directionsWaypointsSource from "../../js/map/directions/waypoints/directionsWaypointsSource";
import directionsWaypointsLayer from "../../js/map/directions/waypoints/directionsWaypointsLayer";
import directionsWaypointsModifyInteraction from "../../js/map/directions/waypoints/directionsWaypointsModify";
import directionsWaypointsSnapInteraction from "../../js/map/directions/waypoints/directionsWaypointsSnap";
import directionsWaypointsDrawInteraction from "../../js/map/directions/waypoints/directionsWaypointsDraw";

import directionsRouteSource from "../../js/map/directions/route/directionsRouteSource";
import directionsRouteLayer from "../../js/map/directions/route/directionsRouteLayer";
import directionsRouteModifyInteraction from "../../js/map/directions/route/directionsRouteModify";
import directionsRouteSnapInteraction from "../../js/map/directions/route/directionsRouteSnap";

import directionsAvoidSource from "../../js/map/directions/avoid/directionsAvoidSource";
import directionsAvoidLayer from "../../js/map/directions/avoid/directionsAvoidLayer";
import directionsAvoidModifyInteraction from "../../js/map/directions/avoid/directionsAvoidModify";
import directionsAvoidSnapInteraction from "../../js/map/directions/avoid/directionsAvoidSnap";
import directionsAvoidDrawInteraction from "../../js/map/directions/avoid/directionsAvoidDraw";
import directionsAvoidSelectInteraction from "../../js/map/directions/avoid/directionsAvoidSelect";

import directionsAvoidPointSource from "../../js/map/directions/avoid/directionsAvoidPointSource";
import directionsAvoidPointLayer from "../../js/map/directions/avoid/directionsAvoidPointLayer";

import directionsAvoidPointDrawInteraction from "../../js/map/directions/avoid/directionsAvoidPointDraw";
import directionsAvoidPointTranslateInteraction from "../../js/map/directions/avoid/directionsAvoidPointTranslate";
import directionsAvoidPointSelectInteraction from "../../js/map/directions/avoid/directionsAvoidPointSelect";


import directionsElevationSource from "../../js/map/directions/elevation/directionsElevationSource";
import directionsElevationLayer from "../../js/map/directions/elevation/directionsElevationLayer";

import stateRouting from "../stateRouting";

export default {
    // Map State
    directionsWaypointsSource,
    directionsWaypointsLayer,

    directionsRouteSource,
    directionsRouteLayer,

    directionsAvoidSource,
    directionsAvoidLayer,

    directionsAvoidPointSource,
    directionsAvoidPointLayer,

    directionsElevationSource,
    directionsElevationLayer,

    // Draw Parameter
    directionsWaypointsModifyInteraction,
    directionsWaypointsSnapInteraction,
    directionsWaypointsDrawInteraction,

    directionsRouteModifyInteraction,
    directionsRouteSnapInteraction,

    directionsAvoidModifyInteraction,
    directionsAvoidSnapInteraction,
    directionsAvoidDrawInteraction,
    directionsAvoidSelectInteraction,

    directionsAvoidPointDrawInteraction,
    directionsAvoidPointTranslateInteraction,
    directionsAvoidPointSelectInteraction,

    // Directions Parameter
    waypoints: [],
    routingAvoidFeaturesOptions: [],
    routingRestrictionsInputData: {
        length: 10.0,
        width: 2.4,
        height: 2.8,
        weight: 18,
        axleload: 6,
        hazmat: false
    },
    // addStartEndPoint defines whether a waypoint,
    // startpoint or endpoint is to be added.
    // -1: default, no input field selected
    // >= 0: index of waypoint with input field selected
    addStartEndPoint: -1,
    keepRoutes: true,
    // Routing Directions Result
    routingDirections: null,
    mapListenerAdded: false,
    isLoadingDirections: false,
    mapInteractionMode: "WAYPOINTS",
    settings: stateRouting.directionsSettings
};
