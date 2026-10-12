import { Fees } from "./Fees";
import { IFeesStrategy } from "./IFeesStrategy";
import { ParkingSpot } from "./ParkingSpot";


export class CarFeesStrategy implements IFeesStrategy {
    parkingSpot: ParkingSpot;
    readonly FEES_PER_HOUR = 5;
    public constructor(parkingSpot: ParkingSpot) {
        this.parkingSpot = parkingSpot;
    }

    public setParkingSpot(parkingSpot: ParkingSpot): void {
        this.parkingSpot = parkingSpot;
    }

    public getParkingSpot(): ParkingSpot {
        return this.parkingSpot;
    }

    calculateFees(parkingSpot: ParkingSpot): number {
        const vehicle = parkingSpot.getVehicle();
        if(!vehicle) throw new Error("Vehicle not found");
        const entryTime = vehicle.getEntryTime();
        const exitTime = vehicle.getExitTime();
        if(!exitTime) throw new Error("Entry time or exit time not found");
        const duration = exitTime.getTime() - entryTime.getTime();
        const hours = Math.round(duration / (1000 * 60 * 60));
        return hours * this.FEES_PER_HOUR;
    }
}