import { Floor } from "./Floor";
import { ParkingSpot } from "./ParkingSpot";

export class FloorBuilder {
    private floor: Floor;

    constructor(floor: Floor) {
        this.floor = floor;
    }

    public build(): Floor {
        return this.floor;
    }

    public addParkingSpot(parkingSpot: ParkingSpot): void {
        this.floor.addParkingSpot(parkingSpot);
    }

    public removeParkingSpot(parkingSpot: ParkingSpot): void {
        this.floor.removeParkingSpot(parkingSpot);
    }
    
    public getParkingSpots(): ParkingSpot[] {
        return this.floor.getParkingSpots();
    }

    public getParkingSpot(id: string): ParkingSpot | undefined {
        return this.floor.getParkingSpot(id);
    }
    
    public getParkingSpotByName(name: string): ParkingSpot | undefined {
        return this.floor.getParkingSpotByName(name);
    }

}