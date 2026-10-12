import { Fees } from "./Fees";
import { ParkingSpot } from "./ParkingSpot";

export interface IFeesStrategy {
    parkingSpot: ParkingSpot;
    readonly FEES_PER_HOUR: number;
    setParkingSpot(parkingSpot: ParkingSpot): void;
    getParkingSpot(): ParkingSpot;
    calculateFees(parkingSpot: ParkingSpot): number;
}
