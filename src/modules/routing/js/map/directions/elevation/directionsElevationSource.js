import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

export default new VectorSource({
    features: [
        new Feature({
            geometry: new Point([])
        })
    ]
});
