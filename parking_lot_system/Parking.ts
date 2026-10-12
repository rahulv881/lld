import { Floor } from "./Floor";
import { ParkingSpot } from "./ParkingSpot";
import { Ticket } from "./Ticket";
import { Vehicle } from "./Vehicle";

export class Parking {
    private id: string;
    private name: string;
    private capacity: number;
    private floors: Floor[];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.capacity = 0;
        this.floors = [];
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getCapacity(): number {
        return this.floors.reduce((acc, floor) => acc + floor.getCapacity(), 0);
    }

    public getAvailableSpaces(): number {
        return this.floors.reduce((acc, floor) => acc + floor.getAvailableSpaces(), 0);
    }

    public getOccupiedSpaces(): number {
        return this.floors.reduce((acc, floor) => acc + floor.getOccupiedSpaces(), 0);
    }

    public getAvailableParkingSpotCount(): number {
        return this.floors.reduce((acc, floor) => acc + floor.getAvailableSpaces(), 0);
    }


    public parkVehicle(vehicle: Vehicle): Ticket {
        const parkingSpot = this.getAvailableParkingSpotByVehicleType(vehicle.getType());
        parkingSpot.occupy(vehicle);
        const ticket = new Ticket(`TICKET_1_${vehicle.getType()}_${vehicle.getId()}`, parkingSpot.getId(), vehicle.getId(), new Date());
        parkingSpot.setTicketId(ticket.getId());
        return ticket;
    }

    public unparkVehicleUsingTicketId(ticketId: string): void {
        const parkingSpot = this.getParkingSpotById(ticketId);
        if(!parkingSpot) throw new Error("Parking spot not found");
        parkingSpot.vacate();
    }

    public unparkVehicleUsingVehicleId(vehicleId: string): void {
        const parkingSpot = this.getParkingSpotByVehicleId(vehicleId);
        if(!parkingSpot) throw new Error("Parking spot not found");
        parkingSpot.vacate();
    }

    public getAvailableParkingSpotByVehicleType(vehicleType: (typeof Vehicle.VEHICLE_TYPES)[number]): ParkingSpot {
        for (const floor of this.floors) {
            const parkingSpot = floor.getAvailableParkingSpotByVehicleType(vehicleType);
            if(parkingSpot) return parkingSpot;
        }
        throw new Error("No available parking spot found");
    }

    public addFloor(floor: Floor): void {
        this.floors.push(floor);
        this.capacity += floor.getCapacity();
    }

    public removeFloor(floor: Floor): void {
        this.floors = this.floors.filter(f => f !== floor);
        this.capacity -= floor.getCapacity();
    }
    
    public getFloors(): Floor[] {
        return this.floors;
    }

    public getParkingSportByTicketId(ticketId: string): ParkingSpot {
        const parkingSpot = this.floors.flatMap(floor => floor.getParkingSpots()).find(spot => spot.getTicketId() === ticketId);
        if(!parkingSpot) throw new Error("Parking spot not found");
        return parkingSpot;
    }

    public getParkingSpotByVehicleId(vehicleId: string): ParkingSpot | undefined {
        return this.floors.flatMap(floor => floor.getParkingSpots()).find(spot => spot.getVehicle()?.getId() === vehicleId);
    }

    public getParkingSpotById(id: string): ParkingSpot {
        const parkingSpot = this.floors.flatMap(floor => floor.getParkingSpots()).find(spot => spot.getId() === id);
        if(!parkingSpot) throw new Error("Parking spot not found");
        return parkingSpot;
    }

    // public getFloor(id: string): Floor | undefined {
    //     return this.floors.find(f => f.getId() === id);
    // }
    
    // public getFloorByName(name: string): Floor | undefined {
    //     return this.floors.find(f => f.getName() === name);
    // }
    
    // public getFloorById(id: string): Floor | undefined {
    //     return this.floors.find(f => f.getId() === id);
    // }
    
    
    // public getFloorByIndex(index: number): Floor | undefined {
    //     return this.floors[index];
    // }
    
    // public getFloorCount(): number {
    //     return this.floors.length;
    // }
    
}

