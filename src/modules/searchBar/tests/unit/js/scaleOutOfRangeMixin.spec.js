import {expect} from "chai";
import sinon from "sinon";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList.js";
import scaleOutOfRangeMixin from "@modules/searchBar/js/scaleOutOfRangeMixin.js";

describe("scaleOutOfRangeMixin", () => {
    const containerName = "MrObject";
    let mixin, context;

    beforeEach(() => {
        mixin = scaleOutOfRangeMixin(containerName);

        context = {
            [containerName]: {id: "1337-42", details: "arbitrary"},
            $t: sinon.stub().callsFake((key, args) => ({key, args})),
            scale: 5000,
            mode: "2D"
        };

        sinon.stub(rawLayerList, "getLayerWhere");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("computed#rawLayers", () => {
        it("returns found raw layers", () => {
            rawLayerList.getLayerWhere
                .withArgs({id: "1337"}).returns({id: "1337", stuff: "lots"})
                .withArgs({id: "42"}).returns({id: "42", stuff: "loads"});
            expect(mixin.computed.rawLayers.call(context)).to.deep.equal([{id: "1337", stuff: "lots"}, {id: "42", stuff: "loads"}]);
        });

        it("skips unknown layers", () => {
            rawLayerList.getLayerWhere
                .withArgs({id: "1337"}).returns(null)
                .withArgs({id: "42"}).returns({id: "42", stuff: "lots"});
            expect(mixin.computed.rawLayers.call(context)).to.deep.equal([{id: "42", stuff: "lots"}]);
        });

        it("returns an empty array if the container id is undefined", () => {
            context[containerName].id = undefined;
            expect(mixin.computed.rawLayers.call(context)).to.deep.equal([]);
        });
    });

    describe("computed#rawLayersScaleBoundaries", () => {
        it("returns overarching minScale and maxScale across layers", () => {
            context.rawLayers = [
                {minScale: "1000", maxScale: "8000"},
                {minScale: "5000", maxScale: "6000"},
                {minScale: "2000", maxScale: "10000"}
            ];
            expect(mixin.computed.rawLayersScaleBoundaries.call(context)).to.deep.equal([1000, 10000]);
        });

        it("skips unparsable and/or missing values", () => {
            context.rawLayers = [
                {},
                {minScale: "NaN", maxScale: "5000"},
                {minScale: "500"},
                {},
                {maxScale: "and large fries with extra mayonnaise"},
                {minScale: "1000", maxScale: "10000"},
                {}
            ];
            expect(mixin.computed.rawLayersScaleBoundaries.call(context)).to.deep.equal([500, 10000]);
        });

        it("returns [undefined, undefined] if no scales are available", () => {
            context.rawLayers = [{}, {}, {}];
            expect(mixin.computed.rawLayersScaleBoundaries.call(context)).to.deep.equal([undefined, undefined]);
        });

        it("returns [undefined, undefined] if no layers are available", () => {
            context.rawLayers = [];
            expect(mixin.computed.rawLayersScaleBoundaries.call(context)).to.deep.equal([undefined, undefined]);
        });
    });

    describe("computed#tooltipText", () => {
        it("returns full tooltip when both minScale and maxScale are defined", () => {
            context.rawLayersScaleBoundaries = [1000, 10000];
            mixin.computed.tooltipText.call(context);
            sinon.assert.calledWith(
                context.$t,
                "common:modules.layerTree.invisibleLayer",
                {minScale: "1 : 1.000", maxScale: "1 : 10.000"}
            );
        });

        it("returns another tooltip if only maxScale is defined", () => {
            context.rawLayersScaleBoundaries = [undefined, 10000];
            mixin.computed.tooltipText.call(context);
            sinon.assert.calledWith(context.$t, "common:modules.layerTree.invisibleLayerNoScale");
        });

        it("returns another tooltip if only minScale is defined", () => {
            context.rawLayersScaleBoundaries = [10000, undefined];
            mixin.computed.tooltipText.call(context);
            sinon.assert.calledWith(context.$t, "common:modules.layerTree.invisibleLayerNoScale");
        });

        it("returns empty string if neither is defined", () => {
            context.rawLayersScaleBoundaries = [undefined, undefined];
            expect(mixin.computed.tooltipText.call(context)).to.equal("");
            expect(context.$t.called).to.be.false;
        });
    });

    describe("computed#scaleIsOutOfRange", () => {
        it("returns false in 3D mode", () => {
            context.rawLayersScaleBoundaries = [0, 10];
            context.scale = 5000;
            context.mode = "3D";
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;
        });

        it("returns true when the scale is too small", () => {
            context.rawLayersScaleBoundaries = [7500, 10000];
            context.scale = 5000;
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;
        });

        it("returns true when the scale is too large", () => {
            context.rawLayersScaleBoundaries = [1000, 2500];
            context.scale = 5000;
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;
        });

        it("returns false when within range", () => {
            context.rawLayersScaleBoundaries = [1000, 10000];
            context.scale = 5000;
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;
        });
    });
});
