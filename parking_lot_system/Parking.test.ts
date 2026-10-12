import { test } from "node:test";
import assert from "node:assert/strict";
import { Floor } from "./Floor";
import { Parking } from "./Parking";
import { ParkingSpot } from "./ParkingSpot";
import { Vehicle } from "./Vehicle";

function buildParking(spotCount: number, declaredCapacity = 10): Parking {
    const floor = new Floor("F1", "Floor 1", declaredCapacity);
    for (let i = 1; i <= spotCount; i++) {
        floor.addParkingSpot(new ParkingSpot(`S${i}`, `S${i}`, "car"));
    }
    const parking = new Parking("P1", "Parking 1");
    parking.addFloor(floor);
    return parking;
}

test("parking a vehicle marks its spot unavailable", () => {
    const parking = buildParking(1);
    const vehicle = new Vehicle("V1", "car", "HR51A0001");
    const spot = parking.getAvailableParkingSpotByVehicleType(vehicle.getType());

    parking.parkVehicle(vehicle);

    assert.equal(spot.getAvailablity(), false);
    assert.equal(spot.getVehicle(), vehicle);
});

test("two vehicles are parked in different spots", () => {
    const parking = buildParking(2);
    const v1 = new Vehicle("V1", "car", "HR51A0001");
    const v2 = new Vehicle("V2", "car", "HR51A0002");

    parking.parkVehicle(v1);
    parking.parkVehicle(v2);

    const [s1, s2] = parking.getFloors()[0].getParkingSpots();
    assert.equal(s1.getVehicle(), v1);
    assert.equal(s2.getVehicle(), v2);
});

test("parking when the lot is full throws instead of overwriting", () => {
    const parking = buildParking(1);
    parking.parkVehicle(new Vehicle("V1", "car", "HR51A0001"));

    assert.throws(() => parking.parkVehicle(new Vehicle("V2", "car", "HR51A0002")), /No available parking spot/);
});

test("available count reflects real spots and occupancy, not declared capacity", () => {
    const parking = buildParking(2, 10);
    assert.equal(parking.getAvailableParkingSpotCount(), 2);

    parking.parkVehicle(new Vehicle("V1", "car", "HR51A0001"));

    assert.equal(parking.getAvailableParkingSpotCount(), 1);
    assert.equal(parking.getFloors()[0].getOccupiedSpaces(), 1);
});
