import {expect} from "chai";
import getters from "../../../store/gettersLayerInformation";
import sinon from "sinon";

describe("src_3_0_0/modules/legend/store/gettersLayerInformation.js", () => {

    afterEach(() => {
        sinon.restore();
    });

    it("urlParams", () => {
        const link1 = "https://geodienste.hamburg.de/download?url=https://geodienste.hamburg.de/HH_WFS_EMobility&f=csv",
            link2 = "https://iot.hamburg.de/v1.1/Things?$filter=Datastreams/properties/serviceName%20eq%20%27HH_STA_E-Ladestationen%27&$count=true&$expand=Locations,Datastreams($expand=Observations($top=3),Sensor,ObservedProperty)",
            state = {
                downloadLinks: [
                    {
                        link: link1,
                        linkName: "name 1"
                    },
                    {
                        link: link2,
                        linkName: "name 2"
                    }
                ]
            },
            urlParamsState = getters.urlParams(state);

        expect(urlParamsState).to.be.an("object");
        expect(urlParamsState.downloadLinks).to.be.an("array");
        expect(urlParamsState.downloadLinks.length).to.be.equals(2);
        expect(urlParamsState.downloadLinks[0].linkName).to.be.equals("name 1");
        expect(decodeURIComponent(urlParamsState.downloadLinks[0].link)).to.be.equals(link1);
        expect(urlParamsState.downloadLinks[1].linkName).to.be.equals("name 2");
        expect(decodeURIComponent(urlParamsState.downloadLinks[1].link)).to.be.equals(link2);

    });

});
