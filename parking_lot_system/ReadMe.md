# Parking Lot System
## Functional requirements
1. Supports multiple **floors**
2. Supports multiple **vehicle** types
3. Alloctes **parking spots**
4. Calculates parking **fees**
5. Frees spot when vehicle exists
6. **Logs** operations
7. Is extensible

### Entites
1. Floor - attribute not class, similar to a building
2. Parking
3. Vehicle
4. ParkingSpots
5. Fees
   1. FeeStrategy // * Missing
   2. FeeCalculator // * Missing
6. Logs
7. Ticket
8. ParkingManager // * Missing

### Actions
1. allotParking - getAvailableParkingSpotByType
2. printReciept - parking.parkVehicle
3. generateFees - TODO
4. logOperation - TODO
5. deallocateParking - ~~parking.unparkVehicleUsingTicketId~~  parking.unparkVehicleUsingVehicleId

### Classes
1. IVehicle
   1. number
   2. type: CAR, VAN TRUCK
2. VehicleFactory
   1. List<Vehicle> vehicles
   2. creatVechicle()
3. IParking
   1. allotParking(Vehicle)
   2. deallocateParking(Vehicle);
   3. getParkingSpotByVehicleNumber(Vehicle)
4. Fees
   1. Map<int,int> rent;
   2. Map,int,int> fine;
5. IParkingSpot
   1. floor
   2. row
   3. column
   4. isAlloted
   5. vehicle
   6. entryTime
   7. exitTime
   8. generateFees()
   9. printReceipt()
6. ILog
   1. message
   2. time