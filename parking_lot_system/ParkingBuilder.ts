import { Floor } from "./Floor";
import { Parking } from "./Parking";

export class ParkingBuilder {
    private parking: Parking;

    constructor(parking: Parking) {
        this.parking = parking;
    }

    public build(): Parking {
        return this.parking;
    }

    public addFloor(floor: Floor): void {
        this.parking.addFloor(floor);
    }

    public removeFloor(floor: Floor): void {
        this.parking.removeFloor(floor);
    }

    public getFloors(): Floor[] {
        return this.parking.getFloors();
    }
    
}