export const OrderStatus = {
    IN_PROGRESS: "inprogress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
