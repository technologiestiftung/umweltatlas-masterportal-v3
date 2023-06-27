global.ResizeObserver = require("resize-observer-polyfill");

class Worker {
    constructor (stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => {
            // empty
        };
    }

    postMessage (msg) {
        this.onmessage(msg);
    }
}
// a mock for web worker
global.Worker = Worker;
