import actions from "../../../store/actionsRotation";
import sinon from "sinon";
import {expect} from "chai";

describe("src_3_0_0/modules/controls/rotation/store/actionsRotation.js", () => {
    let commit, dispatch, getters;

    beforeEach(() => {
        const map2d = {
                id: "ol",
                mode: "2D"
            // getView: () => {
            //     return {
            //         getProjection: () => {
            //             return {
            //                 getCode: () => "EPSG:25832"
            //             };
            //         }
            //     };
            // }
            },
            map3d = {
                id: "olcs",
                mode: "3D"
            };

        mapCollection.clear();
        mapCollection.addMap(map2d, "2D");
        mapCollection.addMap(map3d, "3D");
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("actionsRotation", () => {

        describe("move2d", () => {
            it("move2d to north", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_north"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0], center[1] + distance]);
            });

            it("move2d to south", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_south"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0], center[1] - distance]);
            });

            it("move2d to east", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_east"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0] + distance, center[1]]);
            });
            it("move2d to west", () => {
                const center = [100, 200],
                    distance = 1000,
                    rootGetters = {
                        "Maps/center": center,
                        "Maps/projection": {
                            getMetersPerUnit: sinon.stub().returns(1)
                        }
                    },
                    evt = {
                        currentTarget: {
                            id: "compass_west"
                        }
                    };

                getters.moveDistance = distance;
                actions.move2d({dispatch, getters, rootGetters}, evt);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.deep.equal([center[0] - distance, center[1]]);
            });
        });
    });
});

