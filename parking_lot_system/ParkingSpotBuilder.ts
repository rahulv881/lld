import { ParkingSpot } from "./ParkingSpot";

export class ParkingSpotBuilder {
    private parkingSpots: ParkingSpot[] = [];

    build(id: string, name: string, parkingSpotType: (typeof ParkingSpot.PARKING_SPOT_TYPES)[number]): ParkingSpot {
        return new ParkingSpot(id, name, parkingSpotType);
    }

    public addParkingSpot(parkingSpot: ParkingSpot): void {
        this.parkingSpots.push(parkingSpot);
    }

    public getParkingSpots(): ParkingSpot[] {
        return this.parkingSpots;
    }
}