import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";

import actions from "../../../store/actionsMapsInteractions";

const {
    registerListener,
    unregisterListener
} = actions;

describe("src/core/maps/store/actionsMapsInteractions.js", () => {
    let rootGetters;

    beforeEach(() => {
        rootGetters = {
            map3dParameter: () => {
                return {};
            }
        };
    });

    describe("registerlistener and unregisterlistener", () => {
        let olMap,
            payload;

        before(() => {
            olMap = new Map();
            payload = {
                type: "pointermove",
                listener: "updatePointer",
                listenerType: "dispatch"
            };
            mapCollection.clear();
            mapCollection.addMap(olMap, "2D");
        });

        after(() => {
            sinon.restore();
        });

        it("register pointermove listener to ol map", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy();

            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("pointermove");
        });

        it("unregister pointermove listener from ol map", () => {
            unregisterListener({}, payload);
            expect(Object.keys(olMap.listeners_)).not.include("pointermove");
        });
    });

    describe("setCamera", () => {
        it("should set the camera params to configJs, if 3D map is not created yet", () => {
            const cameraParams = {
                altitude: 127,
                heading: -1.2502079000000208,
                tilt: 45
            };

            actions.setCamera({rootGetters}, cameraParams);

            expect(rootGetters.map3dParameter.camera).to.deep.equals(cameraParams);
        });
    });
    describe("activateViewpoint", () => {

        before(() => {
            const map3d = {
                id: "olcs",
                mode: "3D",
                getCesiumScene: () => {
                    return {
                        camera: {
                            moveUp: "",
                            moveDown: "",
                            moveRight: "",
                            moveLeft: ""
                        }
                    };
                }
            };

            mapCollection.clear();
            mapCollection.addMap(map3d, "3D");
        });
        it("should set camera in case of 3D mode", () => {
            const cameraParams = {
                    heading: -0.30858728378862876,
                    tilt: 0.9321791580603296,
                    altitude: 272.3469798217454
                },
                center = [564028.7954571751, 5934555.967867207],
                zoom = 7.456437968949651;

            actions.activateViewpoint(cameraParams, center, zoom);
            expect(actions.setCamera.calledOnce).to.be.true;

        });
    });
});
