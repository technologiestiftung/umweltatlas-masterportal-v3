import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsImport3D";
import store from "../../../../../../app-store";
import proj4 from "proj4";

describe("Actions", () => {
    let entities,
        defaultDataSource,
        dataSourceDisplay;
    const map3D = {
        id: "1",
        mode: "3D"
    };

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");
        global.Cesium = {
            Cartographic: {
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                })
            },
            Math: {
                toDegrees: () => 9.99455657887449
            }
        };
        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("formatInput", () => {
        it("should format the coordinates correctly for EPSG 4326-DG projection", () => {
            const commit = sinon.spy(),
                state = {currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"}},
                coords = [{id: "northing", value: "53.552070°"}];

            actions.formatInput({state, commit}, coords);
            expect(commit.calledWith("pushCoordinates", ["53.552070", ""])).to.be.true;
        });

        it("should format the coordinates correctly for 'longlat' projection", () => {
            const commit = sinon.spy(),
                state = {currentProjection: {projName: "longlat"}},
                coords = [{id: "longitude", value: "9° 59' 41''"}];

            actions.formatInput({state, commit}, coords);
            expect(commit.calledWith("pushCoordinates", ["9", "59", "41", ""])).to.be.true;
        });

        it("should format the coordinates correctly for other projections", () => {
            const commit = sinon.spy(),
                state = {currentProjection: {id: "otherProjection"}},
                coords = [{id: "hochwert", value: "5936518.07"}];

            actions.formatInput({state, commit}, coords);
            expect(commit.calledWith("pushCoordinates", "5936518.07")).to.be.true;
        });
    });

    describe("newProjectionSelected", () => {
        it("should set the current projection and dispatch 'updatePositionUI'", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                getters = {getProjectionById: sinon.stub().returns({id: "projectionId"})},
                value = "projectionId";

            actions.newProjectionSelected({dispatch, commit, getters}, value);
            expect(commit.calledWith("setCurrentProjection", {id: "projectionId"})).to.be.true;
            expect(dispatch.calledWith("updatePositionUI")).to.be.true;
        });
    });

    describe("updateEntityPosition", () => {
        it("should update the entity position when it exists", () => {
            const dispatch = sinon.spy(),
                state = {
                    currentModelId: "entityId",
                    currentModelPosition: {x: 10, y: 20, z: 30}
                };

            entities = {
                getById: sinon.stub().returns({position: {}})
            };
            defaultDataSource = {entities};
            dataSourceDisplay = {defaultDataSource};
            map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

            actions.updateEntityPosition({dispatch, state, mapCollection});

            expect(entities.getById.calledWith("entityId")).to.be.true;
            expect(dispatch.calledWith("transformToCartesian")).to.be.true;
            expect(entities.getById().position).to.deep.equal({x: 10, y: 20, z: 30});
        });

        it("should not update the entity position when it doesn't exist", () => {
            const dispatch = sinon.spy(),
                state = {currentModelId: "nonExistentId"};

            entities = {
                getById: sinon.stub().returns(null)
            };
            defaultDataSource = {entities};
            dataSourceDisplay = {defaultDataSource};
            map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

            actions.updateEntityPosition({dispatch, state, mapCollection});

            expect(entities.getById.calledWith("nonExistentId")).to.be.true;
            expect(dispatch.calledWith("transformToCartesian")).to.be.false;
        });
    });

    describe("updatePositionUI", () => {
        it("should transform entity position when it exists", () => {
            const dispatch = sinon.spy(),
                state = {
                    currentModelId: "entityId"
                };

            entities = {
                getById: sinon.stub().returns({position: {getValue: sinon.stub().returns({x: 10, y: 20, z: 30})}})
            };
            defaultDataSource = {entities};
            dataSourceDisplay = {defaultDataSource};
            map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

            actions.updatePositionUI({dispatch, state, mapCollection});

            expect(entities.getById.calledWith("entityId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian", {x: 10, y: 20, z: 30})).to.be.true;
        });

        it("should not transform entity position when it doesn't exist", () => {
            const dispatch = sinon.spy(),
                state = {currentModelId: "nonExistentId"};

            entities = {
                getById: sinon.stub().returns(null)
            };
            defaultDataSource = {entities};
            dataSourceDisplay = {defaultDataSource};
            map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

            actions.updatePositionUI({dispatch, state, mapCollection});

            expect(entities.getById.calledWith("nonExistentId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian")).to.be.false;
        });
    });

    describe("incrementCoordinate", () => {
        it("should increment height value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    height: {value: "10.00"}
                };

            actions.incrementCoordinate({dispatch, state}, "height");

            expect(state.height.value).to.equal("10.10");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should increment easting value for EPSG:4326 and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesEasting: {value: "10.00"},
                    currentProjection: {epsg: "EPSG:4326"}
                };

            actions.incrementCoordinate({dispatch, state}, "easting");

            expect(state.coordinatesEasting.value).to.equal("10.000001°");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should increment northing value for EPSG:4326 and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesNorthing: {value: "20.00"},
                    currentProjection: {epsg: "EPSG:4326"}
                };

            actions.incrementCoordinate({dispatch, state}, "northing");

            expect(state.coordinatesNorthing.value).to.equal("20.000001°");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should increment easting value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: [10.000000, 20.000000],
                    coordinatesEasting: {value: "10.00"},
                    currentProjection: {epsg: "someProjection"}
                };

            actions.incrementCoordinate({dispatch, state}, "easting");

            expect(state.coordinatesEasting.value).to.equal("10.10");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should increment northing value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: [10.000000, 20.000000],
                    coordinatesNorthing: {value: "20.00"},
                    currentProjection: {epsg: "someProjection"}
                };

            actions.incrementCoordinate({dispatch, state}, "northing");

            expect(state.coordinatesNorthing.value).to.equal("20.10");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });
    });

    describe("decrementCoordinate", () => {
        it("should decrement height value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    height: {value: "10.00"}
                };

            actions.decrementCoordinate({dispatch, state}, "height");

            expect(state.height.value).to.equal("9.90");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should decrement easting value for EPSG:4326 and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesEasting: {value: "10.00"},
                    currentProjection: {epsg: "EPSG:4326"}
                };

            actions.decrementCoordinate({dispatch, state}, "easting");

            expect(state.coordinatesEasting.value).to.equal("9.999999°");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should decrement northing value for EPSG:4326 and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesNorthing: {value: "20.00"},
                    currentProjection: {epsg: "EPSG:4326"}
                };

            actions.decrementCoordinate({dispatch, state}, "northing");

            expect(state.coordinatesNorthing.value).to.equal("19.999999°");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should decrement easting value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesEasting: {value: "10.00"},
                    currentProjection: {epsg: "someProjection"}
                };

            actions.decrementCoordinate({dispatch, state}, "easting");

            expect(state.coordinatesEasting.value).to.equal("9.90");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });

        it("should decrement northing value and update entity position", () => {
            const dispatch = sinon.spy(),
                state = {
                    selectedCoordinates: ["10.000000", "20.000000"],
                    coordinatesNorthing: {value: "20.00"},
                    currentProjection: {epsg: "someProjection"}
                };

            actions.decrementCoordinate({dispatch, state}, "northing");

            expect(state.coordinatesNorthing.value).to.equal("19.90");
            expect(dispatch.calledWith("formatInput", [state.coordinatesEasting, state.coordinatesNorthing])).to.be.true;
            expect(dispatch.calledWith("updateEntityPosition")).to.be.true;
        });
    });

    describe("transformFromCartesian", () => {
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        it("should transform Cartesian3 coordinates to the currently selected projection", () => {
            const commit = sinon.spy(),
                state = {
                    currentProjection: proj4("EPSG:4326")
                },
                entityPosition = {x: 3739808.2763608, y: 659066.6974853853, z: 5107286.890340484};

            actions.transformFromCartesian({state, commit}, entityPosition);

            expect(commit.firstCall.args[0]).to.equal("setCoordinatesEasting");
            expect(commit.firstCall.args[1]).to.eql({id: "easting", value: "9.99"});
            expect(commit.secondCall.args[0]).to.equal("setCoordinatesNorthing");
            expect(commit.secondCall.args[1]).to.eql({id: "northing", value: "9.99"});
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql({id: "height", value: "6.13"});

        });

        it("should transform Cartesian3 coordinates to the currently selected projection with different conditions", () => {
            const commit = sinon.spy(),
                state = {
                    currentProjection: proj4("EPSG:25832")
                },
                entityPosition = {x: 3739808.2763608, y: 659066.6974853853, z: 5107286.890340484};

            actions.transformFromCartesian({state, commit}, entityPosition);

            expect(commit.firstCall.args[0]).to.equal("setCoordinatesEasting");
            expect(commit.firstCall.args[1]).to.eql({id: "easting", value: "609005.93"});
            expect(commit.secondCall.args[0]).to.equal("setCoordinatesNorthing");
            expect(commit.secondCall.args[1]).to.eql({id: "northing", value: "1104974.86"});
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql({id: "height", value: "6.13"});
        });

    });
});
