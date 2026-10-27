import type { MachineStatus } from "./statuses";
import type { VendingMachineState } from "./VendingMachineState";

/** Everything the machine needs to know about a state, declared next to the state itself. */
export interface StateDefinition<S extends string = MachineStatus> {
    readonly status: S;
    /** Statuses this state may move to. */
    readonly transitions: readonly MachineStatus[];
    /** Statuses that may move into this one, so a new state can wire itself in without editing its neighbours. */
    readonly enteredFrom?: readonly MachineStatus[];
    /** `arg` carries context such as the status an error state resumes to. */
    create(arg?: string): VendingMachineState;
}
