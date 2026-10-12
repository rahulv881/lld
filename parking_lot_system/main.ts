import { CarFeesStrategy } from "./CarFeesStrategy";
import { Fees } from "./Fees";
import { Floor } from "./Floor";
import { MaintainanceParkingSpotState } from "./MaintainanceParkingSpotState";
import { Parking } from "./Parking";
import { ParkingSpotBuilder } from "./ParkingSpotBuilder";
import { Vehicle } from "./Vehicle";

(function() {
    // * TODOs
    // * 0. PRE REQUISITE: Create Parking Spots and Floor
    const parkingSpot = new ParkingSpotBuilder().build("PARKING_SPOT_1", "1", "car");
    const floor = new Floor("FLOOR_1", "1", 10);

    // * 1. Create a parking lot system
    const parking = new Parking("PARKING_1", "First Floor Parking Lot Vendors");

    // * 2. Add a floor to the parking lot
    parking.addFloor(floor);

    // * 3. Add a parking spot to the floor
    floor.addParkingSpot(parkingSpot);
    // // * 4. Get the available parking spotarking("1", "1", 10);
    // const availableParkingSpotCountBeforeParking = parking.getAvailableParkingSpotCount();
    // console.log(`Available parking spot count: ${availableParkingSpotCountBeforeParking}`);

    // // * 5. Park a vehicle in the parking spot
    // const vehicle = new Vehicle("VEHICLE_1", "car", "HR51A0001_ABCD");
    // console.log(parking.getAvailableParkingSpotByVehicleType(vehicle.getType()));
    // const ticket = parking.parkVehicle(vehicle);

    // // * 6. Get the parking spot attached to the vehicle by vehicle id
    // const parkingSpotByVehicleId = parking.getParkingSpotByVehicleId("VEHICLE_1");
    // console.log(`Parking spot by vehicle id: ${parkingSpotByVehicleId?.getVehicle()?.getId()}`);
    // // console.log(`Parking spot: ${parkingSpot}`);

    // // * 7. Print the ticket
    // console.log(`Ticket: ${ticket.getId()}`);
    // // const ticket = parking.printTicket(parkingSpot);
    // // console.log(`Ticket: ${ticket}`);

    // // * 8. Calculate the fees
    // const exitTime = new Date();
    // exitTime.setHours(new Date().getHours() + 1)
    // vehicle.setExitTime(exitTime); // * Will be scanned automatically by the parking system or manually by the user
    // const fees = new Fees(parkingSpot);
    // console.log(`Fees: ${fees.calculateFees()}`);

    // // * 9. Get the available parking spot
    // const availableParkingSpotCountAfterParking = parking.getAvailableParkingSpotCount();
    // console.log(`Available parking spot by vehicle type count: ${availableParkingSpotCountAfterParking}`);

    // // * 10. Unpark a vehicle from the parking spot
    // parking.unparkVehicleUsingVehicleId(vehicle.getId());

    // // * 11. Get the available parking spot
    // const availableParkingSpotCountAfterUnparking = parking.getAvailableParkingSpotCount();
    // console.log(`Available parking spot count: ${availableParkingSpotCountAfterUnparking}`);

    // * PROBLEM STATEMENT
    // * 1. Supports multiple floors
    const floor2 = new Floor("FLOOR_2", "2", 11);
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_2", "2", "car"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_3", "3", "bus"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_4", "4", "truck"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_5", "5", "car"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_6", "6", "bus"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_7", "7", "truck"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_8", "8", "car"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_9", "9", "bus"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_10", "10", "truck"));
    floor2.addParkingSpot(new ParkingSpotBuilder().build("PARKING_SPOT_11", "10", "bike"));
    parking.addFloor(floor2);

    console.log(`Number of floors: ${parking.getFloors().length}`);
    const availableParkingSpotCountBeforeParking = parking.getAvailableParkingSpotCount();
    console.log(`Available parking spot count: ${availableParkingSpotCountBeforeParking}`);


    // * 2. Supports multiple vehicle types
    const car = new Vehicle("VEHICLE_1", "car", "HR51A0001_ABCD");
    const bus = new Vehicle("VEHICLE_1", "bus", "HR51A0001_ABCD");
    const truck = new Vehicle("VEHICLE_1", "truck", "HR51A0001_ABCD");
    const bike = new Vehicle("VEHICLE_1", "bike", "HR51A0001_ABCD");
    const ticket1 = parking.parkVehicle(car);
    console.log(`Ticket: ${ticket1.getId()}`);
    const ticket2 = parking.parkVehicle(bus);
    console.log(`Ticket: ${ticket2.getId()}`);
    const ticket3 = parking.parkVehicle(truck);
    console.log(`Ticket: ${ticket3.getId()}`);
    const ticket4 = parking.parkVehicle(bike);
    console.log(`Ticket: ${ticket4.getId()}`);

    // * 3. Allocates parking spot
    const ticket5 = parking.parkVehicle(car);
    console.log(`Ticket: ${ticket5.getId()}`);
    
    // * 4. Apply strategy pattern to calculate fees
    const exitTime = new Date();
    exitTime.setHours(new Date().getHours() + 1)
    const carParkingSpot = parking.getParkingSpotByVehicleId(car.getId());

    // * 5. Apply state pattern to parkings spot states "AVAILABLE", "OCCUPIED" and "MAINTENANCE"
    console.log(`Car parking spot state AFTER parking: ${carParkingSpot?.getAvailablity()}`);

    if(!carParkingSpot) throw new Error("Car parking spot not found");
    carParkingSpot.getVehicle()?.setExitTime(exitTime);
    const carParkingFees = new Fees(parkingSpot);
    // console.log(`Fees using default strategy: ${carParkingFees.calculateFees()}`);
    
    const carFeesStrategy = new CarFeesStrategy(carParkingSpot);
    carParkingFees.setFeesStrategy(carFeesStrategy);
    // console.log(`Fees using car strategy: ${carParkingFees.calculateFees()}`);

    parking.unparkVehicleUsingVehicleId(car.getId());
    console.log(`Car parking spot state AFTER unparking: ${carParkingSpot?.getAvailablity()}`);
    console.log(`Car parking spot state : ${carParkingSpot?.getStatus()}`);

    const maintenanceParkingSpotState = new MaintainanceParkingSpotState();
    carParkingSpot.setState(maintenanceParkingSpotState);
    console.log(`Car parking spot state AFTER maintenance: ${carParkingSpot?.getAvailablity()}`);

    console.log(`Trying to park a vehicle in maintenance spot: ${carParkingSpot?.getAvailablity()}`);
    const ticket6 = parking.parkVehicle(car);
    console.log(`Ticket: ${ticket6.getId()}`);


})();