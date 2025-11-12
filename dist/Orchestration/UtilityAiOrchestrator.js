"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityAiOrchestrator = void 0;
const IStack_1 = require("./Stack/IStack");
const EventBus_1 = require("../Utils/EventBus");
const SelectionStrategy_1 = require("./SelectionStrategy");
const OrchestrationSink_1 = require("./OrchestrationSink");
class UtilityAiOrchestrator {
    constructor() {
        this.sensors = [];
        this._modules = [];
        this._executionStack = new IStack_1.Stack();
        this._stopAtZero = true;
        this._selectionStrategy = new SelectionStrategy_1.MaxUtilitySelection();
        this.bus = new EventBus_1.EventBus();
    }
    AddSensor(sensor) {
        this.sensors.push(sensor);
        return this;
    }
    AddModule(m) {
        this._modules.push(m);
        return this;
    }
    runAsync(intent, maxTricks, sink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sink == null) {
                sink = OrchestrationSink_1.NullSink.instance;
            }
            for (let i = 0; i < maxTricks; i++) {
                const rt = { bus: this.bus, intent, tick: i };
                sink.onTickStart(rt);
                yield this.senseAsyncAll(rt);
                if (this.TryStopFromSensors(rt, sink))
                    return;
            }
            return Promise.resolve(undefined);
        });
    }
    senseAsyncAll(rt) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const s of this.sensors) {
                yield s.senseAsync(rt);
            }
        });
    }
    TryStopFromSensors(rt, sink) {
        /**
         * TODO IMPLEMENET EVENT
         */
        return false;
    }
}
exports.UtilityAiOrchestrator = UtilityAiOrchestrator;
