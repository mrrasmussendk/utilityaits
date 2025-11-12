import {Runtime} from "../Utils/Runtime";

export interface Sensor {
    senseAsync(rt: Runtime): Promise<void>;
}