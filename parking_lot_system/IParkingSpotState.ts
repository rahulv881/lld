import { PARKING_SPOT_STATES } from "./Constants";

export interface IParkingSpotState {
    status: (typeof PARKING_SPOT_STATES)[number];
    isAvailable(): boolean;
}