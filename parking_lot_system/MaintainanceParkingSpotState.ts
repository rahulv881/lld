import { PARKING_SPOT_STATES } from "./Constants";
import { IParkingSpotState } from "./IParkingSpotState";

export class MaintainanceParkingSpotState implements IParkingSpotState {
    status: (typeof PARKING_SPOT_STATES)[number] = "MAINTENANCE";
    isAvailable(): boolean {
        return false;
    }   
}