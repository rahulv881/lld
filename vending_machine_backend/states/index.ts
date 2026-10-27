import { bulkInventoryDefinition } from "./BulkInventoryState";
import { dispensingDefinition } from "./DispensingState";
import { errorDefinition } from "./ErrorState";
import { idleDefinition } from "./IdleState";
import { maintenanceDefinition } from "./MaintenanceState";
import { processingOrderDefinition } from "./ProcessingOrderState";
import { Status } from "./statuses";

/**
 * Composition root for states: the one place that lists them.
 * To add a state, create its file with a definition and add it here.
 */
export const STATE_DEFINITIONS = [
    idleDefinition,
    processingOrderDefinition,
    dispensingDefinition,
    errorDefinition,
    bulkInventoryDefinition,
    maintenanceDefinition,
] as const;

export const INITIAL_STATUS = Status.IDLE;
