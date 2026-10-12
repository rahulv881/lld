import { ParkingSpot } from "./ParkingSpot";
import { IFeesStrategy } from "./IFeesStrategy";
import { DefaultFeesStrategy } from "./DefaultFeesStrategy";

export class Fees {
    static readonly FEES_PER_HOUR = 10;
    private parkingSpot: ParkingSpot;
    private feesStrategy: IFeesStrategy;

    constructor( parkingSpot: ParkingSpot) {
        this.parkingSpot = parkingSpot;
        this.feesStrategy = new DefaultFeesStrategy(parkingSpot);
    }

    public calculateFees(): number {
        return this.feesStrategy.calculateFees(this.parkingSpot);
    }

    public setFeesStrategy(feesStrategy: IFeesStrategy): void {
        this.feesStrategy = feesStrategy;
    }

    public getFeesStrategy(): IFeesStrategy {
        return this.feesStrategy;
    }
}
