import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsWfsAnalyzer";

/**
 * The attributes of a layer, shaped like parseAttributes returns them.
 * @type {Object[]}
 */
const attributes = [
    {name: "bezirk", title: "Bezirksname", type: "xsd:string", isGeometry: false, isNumeric: false},
    {name: "nutzung", title: "Flächennutzung", type: "xsd:string", isGeometry: false, isNumeric: false},
    {name: "flalle", title: "Flächengröße [m²]", type: "xsd:double", isGeometry: false, isNumeric: true},
    {name: "geom", title: "geom", type: "gml:MultiSurfacePropertyType", isGeometry: true, isNumeric: false}
];

describe("addons/wfsAnalyzer/store/actionsWfsAnalyzer", () => {
    describe("preselectAttributes", () => {
        let commit,
            state,
            warn;

        /**
         * Builds the getters the action reads, mirroring the real ones.
         * @param {Object|null} preset the preset for the selected layer.
         * @returns {Object} the getters.
         */
        function buildGetters (preset) {
            const selectable = attributes.filter((attribute) => !attribute.isGeometry),
                numeric = selectable.filter((attribute) => attribute.isNumeric);

            return {
                preset,
                selectableAttributes: selectable,
                numericAttributes: numeric,
                suggestedAreaAttributes: numeric
            };
        }

        /**
         * Runs the action and reflects the commits back into the state, so the
         * steps that depend on an earlier one behave like they do in Vuex.
         * @param {Object|null} preset the preset for the selected layer.
         * @returns {void}
         */
        function run (preset) {
            commit = sinon.spy((mutation, payload) => {
                if (mutation === "setAreaAttribute") {
                    state.areaAttribute = payload;
                }
                if (mutation === "setMode") {
                    state.mode = payload;
                }
            });
            actions.preselectAttributes({state, getters: buildGetters(preset), commit});
        }

        /**
         * @param {String} mutation name of the mutation.
         * @returns {*} the payload it was committed with.
         */
        function payloadOf (mutation) {
            const call = commit.getCalls().find((candidate) => candidate.args[0] === mutation);

            return call ? call.args[1] : undefined;
        }

        beforeEach(() => {
            state = {areaAttribute: "", mode: "count"};
            warn = sinon.stub(console, "warn");
        });

        afterEach(() => {
            sinon.restore();
        });

        it("preselects the suggested area attribute when there is no preset", () => {
            run(null);

            expect(payloadOf("setAreaAttribute")).to.equal("flalle");
            expect(payloadOf("setFilterAttribute")).to.be.undefined;
            expect(payloadOf("setMode")).to.be.undefined;
            expect(warn.called).to.be.false;
        });

        it("applies every field of a preset", () => {
            run({
                layerId: "a:b",
                filterAttribute: "bezirk",
                analyseAttribute: "nutzung",
                areaAttribute: "flalle",
                mode: "area"
            });

            expect(payloadOf("setFilterAttribute")).to.equal("bezirk");
            expect(payloadOf("setAnalyseAttribute")).to.equal("nutzung");
            expect(payloadOf("setAreaAttribute")).to.equal("flalle");
            expect(payloadOf("setMode")).to.equal("area");
            expect(warn.called).to.be.false;
        });

        it("stores the layer's spelling when the preset differs in case", () => {
            run({layerId: "a:b", filterAttribute: "BEZIRK", areaAttribute: "FLALLE", mode: ""});

            expect(payloadOf("setFilterAttribute")).to.equal("bezirk");
            expect(payloadOf("setAreaAttribute")).to.equal("flalle");
        });

        it("clears a stale filter value when it sets a filter attribute", () => {
            run({layerId: "a:b", filterAttribute: "bezirk", areaAttribute: "", analyseAttribute: "", mode: ""});

            expect(payloadOf("setFilterValue")).to.equal("");
        });

        it("does not let the suggested area attribute override the preset", () => {
            run({layerId: "a:b", filterAttribute: "", areaAttribute: "flalle", analyseAttribute: "", mode: ""});

            const areaCommits = commit.getCalls().filter((call) => call.args[0] === "setAreaAttribute");

            expect(areaCommits).to.have.lengthOf(1);
            expect(areaCommits[0].args[1]).to.equal("flalle");
        });

        it("skips an attribute the layer does not have and warns", () => {
            run({layerId: "a:b", filterAttribute: "gibtsnicht", areaAttribute: "", analyseAttribute: "", mode: ""});

            expect(payloadOf("setFilterAttribute")).to.be.undefined;
            expect(warn.calledOnce).to.be.true;
            expect(warn.firstCall.args[0]).to.contain("filterAttribute");
        });

        it("rejects a non-numeric area attribute and falls back to the suggestion", () => {
            run({layerId: "a:b", filterAttribute: "", areaAttribute: "bezirk", analyseAttribute: "", mode: ""});

            expect(payloadOf("setAreaAttribute")).to.equal("flalle");
            expect(warn.calledOnce).to.be.true;
            expect(warn.firstCall.args[0]).to.contain("areaAttribute");
        });

        it("rejects the geometry as the analysed attribute", () => {
            run({layerId: "a:b", filterAttribute: "", areaAttribute: "", analyseAttribute: "geom", mode: ""});

            expect(payloadOf("setAnalyseAttribute")).to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });

        it("stays in count mode when the layer has no area attribute", () => {
            const getters = buildGetters({
                layerId: "a:b", filterAttribute: "", areaAttribute: "", analyseAttribute: "", mode: "area"
            });

            getters.numericAttributes = [];
            getters.suggestedAreaAttributes = [];
            commit = sinon.spy();
            actions.preselectAttributes({state, getters, commit});

            expect(payloadOf("setMode")).to.be.undefined;
            expect(warn.calledOnce).to.be.true;
            expect(warn.firstCall.args[0]).to.contain("mode");
        });
    });
});
