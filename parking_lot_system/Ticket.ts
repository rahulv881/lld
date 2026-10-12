export class Ticket {
    private id: string;
    private parkingSpotId: string;
    private vehicleId: string;
    private entryTime: Date;
    private exitTime: Date | null;
    private amount: number;
    private minAmount: number;

    constructor(id: string, parkingSpotId: string, vehicleId: string, entryTime: Date) {
        this.id = id;
        this.parkingSpotId = parkingSpotId;
        this.vehicleId = vehicleId;
        this.entryTime = entryTime;
        this.exitTime = null;
        this.minAmount = 100;
        this.amount = this.minAmount;
    }

    public getId(): string {
        return this.id;
    }

    public getParkingSpotId(): string {
        return this.parkingSpotId;
    }
    
    public getVehicleId(): string {
        return this.vehicleId;
    }

    public getEntryTime(): Date {
        return this.entryTime;
    }

    public getExitTime(): Date | null {
        return this.exitTime;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getMinAmount(): number {
        return this.minAmount;
    }
    
    public calculateFees(): number {
        // * TODO: Calculate the fees based on the entry and exit times 
        return this.amount;
    }
}