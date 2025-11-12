"use strict";
// UtilityAi/Utils/intent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIntent = exports.IntentGoal = void 0;
class IntentGoal {
    constructor(name) {
        this.name = name;
    }
}
exports.IntentGoal = IntentGoal;
class UserIntent {
    // Implementation
    constructor(...args) {
        if (typeof args[0] === "string") {
            // Legacy cases
            if (args.length === 1) {
                const query = args[0];
                this.goal = new IntentGoal("unspecified");
                this.slots = Object.freeze({ query });
                return;
            }
            if (args.length === 3 && typeof args[1] === "string" && typeof args[2] === "string") {
                const [query, delivery, topic] = args;
                this.goal = new IntentGoal("legacy");
                this.slots = Object.freeze({ query, delivery, topic });
                return;
            }
            throw new TypeError("Invalid legacy UserIntent constructor arguments.");
        }
        // Standard constructor
        const [goal, slots, requestId, locale] = args;
        if (!(goal instanceof IntentGoal)) {
            throw new TypeError("UserIntent requires an IntentGoal as the first argument.");
        }
        this.goal = goal;
        this.slots = slots ? Object.freeze(Object.assign({}, slots)) : undefined;
        this.requestId = requestId;
        this.locale = locale;
    }
}
exports.UserIntent = UserIntent;
