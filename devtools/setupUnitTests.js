global.ResizeObserver = require("resize-observer-polyfill");

/**
 * Mock for web worker
 */
class Worker {
    /**
     * Constructor
     * @param {String} stringUrl 
     */
    constructor (stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => {
            // empty
        };
    }

    /**
     * Post message
     * @param {String} msg 
     */
    postMessage (msg) {
        this.onmessage(msg);
    }
}
// a mock for web worker
global.Worker = Worker;
