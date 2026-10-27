/** Status labels the machine can report. Dependency-free so states, machine and UI can all import it. */
export const Status = {
    IDLE: "IDLE",
    PROCESSING_ORDER: "PROCESSING_ORDER",
    DISPENSING_ORDER: "DISPENSING_ORDER",
    ERROR: "ERROR",
    BULK_INVENTORY_UPDATE: "BULK_INVENTORY_UPDATE",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
} as const;

export type MachineStatus = (typeof Status)[keyof typeof Status];
