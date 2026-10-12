import { ParkingSpot } from "./ParkingSpot";
import { Vehicle } from "./Vehicle";

export class Floor {
    private id: string;
    private name: string;
    private capacity: number;
    private parkingSpots: ParkingSpot[];

    constructor(id: string, name: string, capacity: number) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.parkingSpots = [];
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }
    
    public getCapacity(): number {
        return this.capacity;
    }
    
    // Derived from the spots so the counts can't drift from actual occupancy
    public getAvailableSpaces(): number {
        return this.parkingSpots.filter(p => p.getAvailablity()).length;
    }

    public getOccupiedSpaces(): number {
        return this.parkingSpots.length - this.getAvailableSpaces();
    }

    public addParkingSpot(parkingSpot: ParkingSpot): void {
        this.parkingSpots.push(parkingSpot);
    }

    public removeParkingSpot(parkingSpot: ParkingSpot): void {
        this.parkingSpots = this.parkingSpots.filter(p => p !== parkingSpot);
    }
    
    public getParkingSpots(): ParkingSpot[] {
        return this.parkingSpots;
    }

    public getParkingSpot(id: string): ParkingSpot | undefined {
        return this.parkingSpots.find(p => p.getId() === id);
    }
    
    public getParkingSpotByName(name: string): ParkingSpot | undefined {
        return this.parkingSpots.find(p => p.getName() === name);
    }


    public getAvailableParkingSpotByVehicleType(type: (typeof Vehicle.VEHICLE_TYPES)[number]): ParkingSpot | undefined {
        const parkingSpot = this.parkingSpots.find(p => p.getParkingSpotType() === type && p.getAvailablity());
        return parkingSpot;
    }
}