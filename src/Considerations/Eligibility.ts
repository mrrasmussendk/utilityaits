import {Runtime} from "../Utils/Runtime";

export interface Eligibility {

    isEligible(rt: Runtime): boolean;
}