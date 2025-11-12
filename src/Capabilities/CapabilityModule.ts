import {Runtime} from "../Utils/Runtime";
import {Proposal} from "../Considerations/Proposal";

export interface CapabilityModule {
    propose(rt: Runtime): Proposal[]
}