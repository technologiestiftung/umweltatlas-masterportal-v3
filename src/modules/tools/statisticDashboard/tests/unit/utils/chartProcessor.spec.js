import {expect} from "chai";
import chartProcessor from "../../../utils/chartProcessor";

describe("/src/modules/tools/statisticDashboard/utils/chartProcessor.js", () => {
    describe("parsePreparedDataToLineChartFormat", () => {
        it("should return an empty object if given param is not an object", () => {
            expect(chartProcessor.parsePreparedDataToLineChartFormat(null)).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat(undefined)).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat([])).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat(true)).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat(false)).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat(1234)).to.be.an("object").that.is.empty;
            expect(chartProcessor.parsePreparedDataToLineChartFormat("1234")).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if an empty object is given", () => {
            expect(chartProcessor.parsePreparedDataToLineChartFormat({})).to.be.deep.equal({datasets: [], labels: []});
        });
        it("should return expected object", () => {
            const param = {
                    "foo": {"bar": [1, 2, 3], "bow": [2, 3, 4]}
                },
                expected = {
                    datasets: [
                        {
                            fill: false,
                            label: "foo",
                            data: [[1, 2, 3], [2, 3, 4]]
                        }
                    ],
                    labels: ["bar", "bow"]
                };

            expect(chartProcessor.parsePreparedDataToLineChartFormat(param)).to.be.deep.equal(expected);
        });
    });
    describe("parsePreparedDataToBarChartFormat", () => {
        it("should return an empty array if no object is given", () => {
            expect(chartProcessor.parsePreparedDataToBarChartFormat(null)).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat(undefined)).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat([])).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat(true)).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat(false)).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat(1234)).to.be.an("array").that.is.empty;
            expect(chartProcessor.parsePreparedDataToBarChartFormat("1234")).to.be.an("array").that.is.empty;
        });
        it("should return an empty array if given object is empty", () => {
            expect(chartProcessor.parsePreparedDataToBarChartFormat({})).to.be.an("array").that.is.empty;
        });
        it("should return expected array", () => {
            const param = {
                    "foo": {
                        "bar": 1
                    },
                    "bow": {
                        "bar": 2
                    }
                },
                expected = [1, 2];

            expect(chartProcessor.parsePreparedDataToBarChartFormat(param)).to.be.deep.equal(expected);
        });
    });
});
