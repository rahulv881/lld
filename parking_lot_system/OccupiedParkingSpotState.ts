import { PARKING_SPOT_STATES } from "./Constants";
import { IParkingSpotState } from "./IParkingSpotState";

export class OccupiedParkingSpotState implements IParkingSpotState {
    status: (typeof PARKING_SPOT_STATES)[number] = "OCCUPIED";
    isAvailable(): boolean {
        return false;
    }   
}