import { Vehicle } from "./Vehicle";
import { PARKING_SPOT_STATES, VEHICLE_TYPES } from "./Constants";
import { IParkingSpotState } from "./IParkingSpotState";
import { AvailableParkingSpotState } from "./AvailableParkingSpotState";
import { OccupiedParkingSpotState } from "./OccupiedParkingSpotState";

export class ParkingSpot {
    private id: string;
    private name: string;
    // private isAvailable: boolean;
    private state: IParkingSpotState;
    private vehicle: Vehicle | undefined;
    private ticketId: string | undefined;
    private static PARKING_SPOT_TYPES = VEHICLE_TYPES;
    private parkingSpotType: (typeof ParkingSpot.PARKING_SPOT_TYPES)[number];


    constructor(id: string, name: string, parkingSpotType: (typeof ParkingSpot.PARKING_SPOT_TYPES)[number]) {
        this.id = id;
        this.name = name;
        // this.isAvailable = true;
        this.state = new AvailableParkingSpotState();
        this.parkingSpotType = parkingSpotType;
    }

    public setState(state: IParkingSpotState): void {
        // if(state.status !== "AVAILABLE") throw new Error("Parking spot is not available");
        if(this.state.status !== "AVAILABLE") throw new Error("Parking spot is not available");
        this.state = state;
    }

    public getStatus(): (typeof PARKING_SPOT_STATES)[number] {
        return this.state.status;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getParkingSpotType(): (typeof ParkingSpot.PARKING_SPOT_TYPES)[number] {
        return this.parkingSpotType;
    }

    public getAvailablity(): boolean {
        return this.state.isAvailable();
    }

    public setAvailablity(isAvailable: boolean): void {
        // this.isAvailable = isAvailable;
        if(isAvailable) {
            this.state = new AvailableParkingSpotState();
        } else {
            this.state = new OccupiedParkingSpotState();
        }
    }

    public getVehicle(): Vehicle | undefined {
        return this.vehicle;
    }

    public setVehicle(vehicle: Vehicle): void {
        this.vehicle = vehicle;
    }

    public setTicketId(ticketId: string): void {
        this.ticketId = ticketId;
    }

    public getTicketId(): string | undefined {
        return this.ticketId;
    }

    public static getVehicleTypeByParkingSpotType(parkingSpotType: (typeof ParkingSpot.PARKING_SPOT_TYPES)[number]): (typeof Vehicle.VEHICLE_TYPES)[number] {
        return Vehicle.VEHICLE_TYPES[ParkingSpot.PARKING_SPOT_TYPES.indexOf(parkingSpotType)];
    }

    public occupy(vehicle: Vehicle): void {
        if (!this.state.isAvailable()) {
            throw new Error("Parking spot is not available");
        }
        this.vehicle = vehicle;
        this.state = new OccupiedParkingSpotState();
    }

    public vacate(): void {
        if (this.state.isAvailable()) {
            throw new Error("Parking spot is already available");
        }
        this.vehicle = undefined;
        this.state = new AvailableParkingSpotState();
        this.ticketId = undefined;
    }


}