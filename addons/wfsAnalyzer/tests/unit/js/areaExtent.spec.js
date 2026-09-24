import {expect} from "chai";
import {buildAreaImageUrl, readAlphaExtent} from "../../../js/areaExtent";

describe("addons/wfsAnalyzer/js/areaExtent", () => {
    describe("buildAreaImageUrl", () => {
        const params = {
            wmsUrl: "https://gdi.berlin.de/services/wms/ua_flaechennutzung",
            layerName: "a_reale_nutzung_bebaute_flaechen_2021",
            cqlFilter: "bezirk='Mitte'",
            extent: [384000, 5817000, 394000, 5826000],
            crs: "EPSG:25833",
            width: 300,
            height: 270
        };

        it("passes the extent easting first", () => {
            const url = new URL(buildAreaImageUrl(params));

            // The service reads the extent this way even in WMS 1.3.0, where
            // the projection's axis order would put northing first - and it
            // answers a swapped extent with an empty image, not an error.
            expect(url.searchParams.get("bbox")).to.equal("384000,5817000,394000,5826000");
            expect(url.searchParams.get("crs")).to.equal("EPSG:25833");
        });

        it("asks for a transparent image of the given size", () => {
            const url = new URL(buildAreaImageUrl(params));

            expect(url.searchParams.get("request")).to.equal("GetMap");
            expect(url.searchParams.get("transparent")).to.equal("true");
            expect(url.searchParams.get("width")).to.equal("300");
            expect(url.searchParams.get("height")).to.equal("270");
        });

        it("carries the highlight style and the filter", () => {
            const url = new URL(buildAreaImageUrl(params));

            expect(url.searchParams.get("cql_filter")).to.equal("bezirk='Mitte'");
            expect(url.searchParams.get("sld_body")).to.contain("a_reale_nutzung_bebaute_flaechen_2021");
            expect(url.searchParams.get("format_options")).to.equal("antialias:none");
        });

        it("leaves the filter out when there is none", () => {
            const url = new URL(buildAreaImageUrl({...params, cqlFilter: ""}));

            expect(url.searchParams.has("cql_filter")).to.equal(false);
        });
    });

    describe("readAlphaExtent", () => {
        const size = {width: 10, height: 10, extent: [0, 0, 100, 100]};

        /**
         * Builds image data with the given pixels visible.
         * @param {Number[][]} pixels the visible pixels as [column, row].
         * @returns {Uint8ClampedArray} the RGBA data.
         */
        function imageWith (pixels) {
            const data = new Uint8ClampedArray(size.width * size.height * 4);

            pixels.forEach(([column, row]) => {
                data[(row * size.width + column) * 4 + 3] = 255;
            });

            return data;
        }

        it("bounds the visible pixels by their outer edges", () => {
            // Columns 2-4 and rows 1-3, with row 0 at the top of the image.
            const pixels = [];

            for (let row = 1; row <= 3; row++) {
                for (let column = 2; column <= 4; column++) {
                    pixels.push([column, row]);
                }
            }

            expect(readAlphaExtent(imageWith(pixels), size)).to.deep.equal([20, 60, 50, 90]);
        });

        it("returns a whole cell for a single pixel, never a point", () => {
            expect(readAlphaExtent(imageWith([[0, 0]]), size)).to.deep.equal([0, 90, 10, 100]);
            expect(readAlphaExtent(imageWith([[9, 9]]), size)).to.deep.equal([90, 0, 100, 10]);
        });

        it("counts a barely visible pixel, because edges fade out", () => {
            const data = new Uint8ClampedArray(size.width * size.height * 4);

            data[3] = 1;

            expect(readAlphaExtent(data, size)).to.not.equal(null);
        });

        it("returns null when nothing is visible", () => {
            expect(readAlphaExtent(new Uint8ClampedArray(size.width * size.height * 4), size)).to.equal(null);
        });

        it("spans everything when the whole image is covered", () => {
            const pixels = [];

            for (let row = 0; row < size.height; row++) {
                for (let column = 0; column < size.width; column++) {
                    pixels.push([column, row]);
                }
            }

            expect(readAlphaExtent(imageWith(pixels), size)).to.deep.equal([0, 0, 100, 100]);
        });
    });
});
