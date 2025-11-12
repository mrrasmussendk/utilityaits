import {UserIntent} from "./UserIntent";
import {EventBus} from "./EventBus";

export interface Runtime {
    bus: EventBus,
    intent: UserIntent,
    tick: number
}