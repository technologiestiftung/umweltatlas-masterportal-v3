import {expect} from "chai";
import sinon from "sinon";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import scaleOutOfRangeMixin from "@modules/searchBar/js/scaleOutOfRangeMixin";

describe("scaleOutOfRangeMixin", () => {
    const containerName = "MrObject",
        mixin = scaleOutOfRangeMixin(containerName);

    let context;

    beforeEach(() => {
        context = {
            [containerName]: {id: "1337", details: "arbitrary"},
            $t: sinon.stub().callsFake((key, args) => ({key, args})),
            scale: 5000,
            mode: "2D"
        };

        sinon.stub(rawLayerList, "getLayerWhere");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("computed#rawLayer", () => {
        it("returns layer from rawLayerList", () => {
            const fakeLayer = {id: "1337", stuff: "lots"};

            rawLayerList.getLayerWhere.returns(fakeLayer);

            expect(mixin.computed.rawLayer.call(context)).to.equal(fakeLayer);
            sinon.assert.calledWith(rawLayerList.getLayerWhere, {id: "1337"});
        });

        it("returns null if not found", () => {
            rawLayerList.getLayerWhere.returns(undefined);
            expect(mixin.computed.rawLayer.call(context)).to.be.null;
        });
    });

    describe("computed#tooltipText", () => {
        it("returns tooltip with scale information if fully available", () => {
            context.rawLayer = {minScale: "1000", maxScale: "10000"};
            const result = mixin.computed.tooltipText.call(context);

            sinon.assert.calledWith(context.$t, "common:modules.layerTree.invisibleLayer", {
                minScale: "1 : 1.000",
                maxScale: "1 : 10.000"
            });
            expect(result.key).to.equal("common:modules.layerTree.invisibleLayer");
        });

        it("returns tooltip without scale information if not both available", () => {
            context.rawLayer = {minScale: "1000"};
            const result = mixin.computed.tooltipText.call(context);

            sinon.assert.calledWith(context.$t, "common:modules.layerTree.invisibleLayerNoScale");
            expect(result.key).to.equal("common:modules.layerTree.invisibleLayerNoScale");
        });

        it("returns empty string if no scale configured", () => {
            context.rawLayer = {};
            expect(mixin.computed.tooltipText.call(context)).to.equal("");
        });

        it("returns empty string if rawLayer null", () => {
            context.rawLayer = null;
            expect(mixin.computed.tooltipText.call(context)).to.equal("");
        });
    });

    describe("computed#scaleIsOutOfRange", () => {
        it("returns false in 3D mode", () => {
            context.mode = "3D";
            context.scale = 1;
            context.rawLayer = {minScale: "100", maxScale: "10000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;
        });

        it("returns true if current scale > maxScale", () => {
            context.scale = 2000;

            context.rawLayer = {minScale: "100", maxScale: "1000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;

            context.rawLayer = {maxScale: "1000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;
        });

        it("returns true if current scale < minScale", () => {
            context.scale = 500;

            context.rawLayer = {minScale: "1000", maxScale: "10000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;

            context.rawLayer = {minScale: "1000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.true;
        });

        it("returns false if scale within layer's range", () => {
            context.scale = 5000;

            context.rawLayer = {minScale: "1000", maxScale: "10000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;

            context.rawLayer = {maxScale: "10000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;

            context.rawLayer = {minScale: "1000"};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;
        });

        it("returns false if no scale boundaries defined", () => {
            context.rawLayer = {};
            expect(mixin.computed.scaleIsOutOfRange.call(context)).to.be.false;
        });
    });
});
