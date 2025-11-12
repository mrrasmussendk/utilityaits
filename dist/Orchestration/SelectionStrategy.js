"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxUtilitySelection = void 0;
class MaxUtilitySelection {
    select(scored) {
        if (scored.length == 0)
            throw new Error("No proposals to select from.");
        // Assuming scored is already ordered desc by utility
        return scored[0].P;
    }
}
exports.MaxUtilitySelection = MaxUtilitySelection;
