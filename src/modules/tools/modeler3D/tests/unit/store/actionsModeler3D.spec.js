import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsModeler3D";
import store from "../../../../../../app-store";
import proj4 from "proj4";

describe("Actions", () => {
    let entities,
        scene,
        getters;
    const map3D = {
        id: "1",
        mode: "3D",
        getCesiumScene: () => {
            return scene;
        }
    };

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");
        global.Cesium = {
            Cartesian3: {
                fromDegrees: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                })
            },
            Cartographic: {
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                })
            },
            Math: {
                toDegrees: () => 9.99455657887449,
                toRadians: () => 0.97
            }
        };
        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };
        scene = {
            globe: {
                getHeight: () => {
                    return 5.7896;
                }
            }
        };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("deleteEntity", () => {
        it("should delete the entity from list and entityCollection", (done) => {
            const commit = sinon.spy(),
                state = {importedModels: [{id: 1}]},
                id = 1;

            entities = {
                getById: sinon.stub().returns({id: id}),
                removeById: sinon.spy()
            };
            getters = {
                scene: scene,
                entities: entities
            };

            actions.deleteEntity({state, getters, commit}, id);
            setTimeout(() => {
                expect(entities.removeById.calledWith(1)).to.be.true;
                expect(commit.calledWith("setCurrentModelId", null)).to.be.true;
                done();
            }, 20);
        });

        it("should not delete the entity when not found in list", (done) => {
            const commit = sinon.spy(),
                state = {importedModels: [{id: 5}]},
                id = 1;

            entities = {
                getById: sinon.stub().returns(null),
                removeById: sinon.spy()
            };
            getters = {
                scene: scene,
                entities: entities
            };

            actions.deleteEntity({state, getters, commit}, id);
            setTimeout(() => {
                expect(entities.removeById.calledWith(1)).to.be.false;
                expect(commit.calledWith("setCurrentModelId", null)).to.be.false;
                done();
            }, 20);
        });
    });

    describe("confirmDeletion", () => {
        it("should open the modal dialog to confirm action", () => {
            const dispatch = sinon.spy(),
                id = 1;

            store.dispatch = sinon.spy();
            getters = {
                getModelNameById: sinon.stub().returns("House")
            };

            actions.confirmDeletion({dispatch, getters}, id);
            expect(store.dispatch.firstCall.args[0]).to.equal("ConfirmAction/addSingleAction");
        });
    });

    describe("newProjectionSelected", () => {
        it("should set the current projection and dispatch 'updatePositionUI'", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                value = "projectionId";

            getters = {getProjectionById: sinon.stub().returns({id: "projectionId"})};

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
            getters = {
                scene: scene,
                entities: entities
            };
            // TODO: Neuen Getter testen
            // defaultDataSource = {entities};
            // dataSourceDisplay = {defaultDataSource};
            // map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

            actions.updateEntityPosition({dispatch, state, getters});

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
            getters = {
                scene: scene,
                entities: entities
            };

            actions.updateEntityPosition({dispatch, state, getters});

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
            getters = {
                scene: scene,
                entities: entities
            };

            actions.updatePositionUI({dispatch, state, getters});

            expect(entities.getById.calledWith("entityId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian", {x: 10, y: 20, z: 30})).to.be.true;
        });

        it("should not transform entity position when it doesn't exist", () => {
            const dispatch = sinon.spy(),
                state = {currentModelId: "nonExistentId"};

            entities = {
                getById: sinon.stub().returns(null)
            };
            getters = {
                scene: scene,
                entities: entities
            };

            actions.updatePositionUI({dispatch, state, getters});

            expect(entities.getById.calledWith("nonExistentId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian")).to.be.false;
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

            expect(commit.firstCall.args[0]).to.equal("setCoordinateEasting");
            expect(commit.firstCall.args[1]).to.eql(9.99455657887449);
            expect(commit.secondCall.args[0]).to.equal("setCoordinateNorthing");
            expect(commit.secondCall.args[1]).to.eql(9.99455657887449);
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql(6.134088691520464);

        });

        it("should transform Cartesian3 coordinates to the currently selected projection with different conditions", () => {
            const commit = sinon.spy(),
                state = {
                    currentProjection: proj4("EPSG:25832")
                },
                entityPosition = {x: 3739808.2763608, y: 659066.6974853853, z: 5107286.890340484};

            actions.transformFromCartesian({state, commit}, entityPosition);

            expect(commit.firstCall.args[0]).to.equal("setCoordinateEasting");
            expect(commit.firstCall.args[1]).to.eql(609005.9265606481);
            expect(commit.secondCall.args[0]).to.equal("setCoordinateNorthing");
            expect(commit.secondCall.args[1]).to.eql(1104974.8560725104);
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql(6.134088691520464);
        });
    });

    describe("transformToCartesian", () => {
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        it("should transform coordinates of the currently selected projection to cartesian", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: false,
                    coordinateEasting: 10.00,
                    coordinateNorthing: 53.557,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:4326",
                        id: "someId",
                        projName: "longlat"
                    }
                };

            actions.transformToCartesian({state, dispatch, commit});

            expect(commit.firstCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.firstCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });

        it("should transform coordinates of the currently selected projection to cartesian with different conditions", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: false,
                    coordinateEasting: 566242.52,
                    coordinateNorthing: 5934700.15,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:25832",
                        id: "someId",
                        projName: "utm"
                    }
                };

            actions.transformToCartesian({state, dispatch, commit});

            expect(commit.firstCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.firstCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });

        it("should transform coordinates of the currently selected projection to cartesian and correct the height to globe height", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: true,
                    coordinateEasting: 10.00,
                    coordinateNorthing: 53.557,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:4326",
                        id: "someId",
                        projName: "longlat"
                    }
                };

            getters = {
                scene: scene,
                entities: entities
            };

            actions.transformToCartesian({state, dispatch, commit, getters});

            expect(commit.firstCall.args[0]).to.equal("setHeight");
            expect(commit.firstCall.args[1]).to.eql(5.7896);
            expect(commit.secondCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.secondCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });
    });
});
