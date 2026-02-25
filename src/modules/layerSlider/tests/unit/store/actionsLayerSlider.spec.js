import sinon from "sinon";
import testAction from "@devtools/tests/VueTestUtils.js";
import actions from "@modules/layerSlider/store/actionsLayerSlider.js";

const {
    addInformationToLayerIds,
    checkIfAllLayersAvailable,
    sendModification,
    setActiveIndex,
    toggleLayerVisibility
} = actions;


describe("src/modules/layerSlider/store/actionsLayerSlider.js", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("addInformationToLayerIds", () => {
        it("addInformationToLayerIds", done => {
            const layerIds = [
                    {
                        layerId: "123",
                        title: "Pommes"
                    },
                    {
                        layerId: "456",
                        title: "Ketchup"
                    },
                    {
                        layerId: "789",
                        title: "Mayonnaise"
                    }
                ],
                layerIdsWithInformation = [
                    {
                        layerId: "123",
                        title: "Pommes",
                        index: 0,
                        visibility: false,
                        transparency: 0
                    },
                    {
                        layerId: "456",
                        title: "Ketchup",
                        index: 1,
                        visibility: true,
                        transparency: 1
                    },
                    {
                        layerId: "789",
                        title: "Mayonnaise",
                        index: 2,
                        visibility: false,
                        transparency: 2
                    }
                ];

            testAction(addInformationToLayerIds, layerIds, {}, {}, [
                {type: "setLayerIds", payload: layerIdsWithInformation}
            ], {}, done, {
                allLayerConfigs: [
                    {id: "123", visibility: false, transparency: 0},
                    {id: "456", visibility: true, transparency: 1},
                    {id: "789", visibility: false, transparency: 2}
                ]
            });
        });
    });

    describe("checkIfAllLayersAvailable", () => {
        it("checkIfAllLayersAvailable", done => {
            const layerIds = [
                    {
                        layerId: "123",
                        title: "Pommes",
                        index: 0
                    }
                ],
                rootGetters = {
                    allLayerConfigs: [
                        {
                            id: "123"
                        }
                    ]
                };

            testAction(checkIfAllLayersAvailable, layerIds, {}, {}, [
                {type: "setLayerIds", payload: layerIds}
            ], {}, done, rootGetters);
        });
    });

    describe("sendModification", () => {
        it("sendModification", done => {
            const layerId = {
                    layerId: "123",
                    title: "Pommes",
                    index: 0
                },
                visibility = true,
                transparency = 0.5;

            testAction(sendModification, {layerId, visibility, transparency}, {}, {}, [
                {
                    type: "replaceByIdInLayerConfig",
                    payload: {
                        layerConfigs: [{
                            id: layerId,
                            layer: {
                                visibility: visibility,
                                transparency: transparency
                            }
                        }]
                    },
                    dispatch: true
                }
            ], {}, done);
        });
    });

    describe("setActiveIndex", () => {
        it("setActiveIndex", done => {
            const activeLayer = {
                    layerId: "123",
                    title: "Pommes",
                    index: 0
                },
                layerIds = [
                    {
                        layerId: "123",
                        title: "Pommes",
                        index: 0
                    },
                    {
                        layerId: "456",
                        title: "Ketchup",
                        index: 1
                    },
                    {
                        layerId: "789",
                        title: "Myonnaise",
                        index: 2
                    }
                ],
                state = {
                    activeLayer,
                    layerIds
                };

            testAction(setActiveIndex, 0, state, {}, [
                {type: "setActiveLayer", payload: layerIds[0]},
                {type: "toggleLayerVisibility", payload: activeLayer.layerId, dispatch: true}
            ], {}, done);
        });
    });

    describe("toggleLayerVisibility", () => {
        it("toggleLayerVisibility", done => {
            const activeLayerId = "123",
                state = {
                    layerIds: [
                        {
                            layerId: "123",
                            title: "Pommes",
                            index: 0
                        },
                        {
                            layerId: "456",
                            title: "Ketchup",
                            index: 1
                        },
                        {
                            layerId: "789",
                            title: "Myonnaise",
                            index: 2
                        }
                    ]
                };

            testAction(toggleLayerVisibility, activeLayerId, state, {}, [
                {type: "sendModification", payload: {layerId: "123", visibility: true}, dispatch: true},
                {type: "sendModification", payload: {layerId: "456", visibility: false}, dispatch: true},
                {type: "sendModification", payload: {layerId: "789", visibility: false}, dispatch: true}
            ], {}, done);
        });
    });
});
