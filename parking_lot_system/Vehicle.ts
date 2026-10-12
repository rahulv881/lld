import { ParkingSpot } from "./ParkingSpot";

export class Vehicle {
    private id: string;
    private type: typeof Vehicle.VEHICLE_TYPES[number];
    private licensePlate: string;
    private entryTime: Date;
    private exitTime: Date | null;
    static readonly VEHICLE_TYPES = ["car", "bike", "bus", "truck"] as const;

    constructor(id: string, type: (typeof Vehicle.VEHICLE_TYPES)[number], licensePlate: string) {
        this.id = id;
        this.type = type;
        this.licensePlate = licensePlate;
        this.entryTime = new Date();
        this.exitTime = null
    }

    public getId(): string {
        return this.id;
    }

    public getType(): (typeof Vehicle.VEHICLE_TYPES)[number] {
        return this.type;
    }

    public getLicensePlate(): string {
        return this.licensePlate;
    }

    public getEntryTime(): Date {
        return this.entryTime;
    }
    
    public getExitTime(): Date | null {
        return this.exitTime;
    }

    public setExitTime(exitTime: Date): void {
        this.exitTime = exitTime;
    }
    
    
}