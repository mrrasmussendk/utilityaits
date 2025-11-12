import {Runtime} from "../Utils/Runtime";

export interface Consideration {
    evaluate(rt: Runtime): number;
}