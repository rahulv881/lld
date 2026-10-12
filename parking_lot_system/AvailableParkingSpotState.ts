import { PARKING_SPOT_STATES } from "./Constants";
import { IParkingSpotState } from "./IParkingSpotState";

export class AvailableParkingSpotState implements IParkingSpotState {
    status: (typeof PARKING_SPOT_STATES)[number] = "AVAILABLE";
    isAvailable(): boolean {
        return true;
    }
}