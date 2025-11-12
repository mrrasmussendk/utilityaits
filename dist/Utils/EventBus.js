"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
exports.createEventKey = createEventKey;
class EventBus {
    constructor() {
        this.latest = new Map();
    }
    publish(key, msg) {
        this.latest.set(key, msg);
    }
    /**
     * Try to get the latest message for a given key.
     * Returns a tuple like C#'s TryGet: [found, valueIfFound]
     */
    tryGet(key) {
        if (this.latest.has(key)) {
            return [true, this.latest.get(key)];
        }
        return [false, undefined];
    }
    /** Get the latest message for a given key or undefined if none. */
    getOrDefault(key) {
        return this.latest.get(key);
    }
}
exports.EventBus = EventBus;
/** Helper to create a unique key when you don’t have a class type. */
function createEventKey(description) {
    return Symbol(description);
}
