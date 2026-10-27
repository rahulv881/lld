import { EventType } from "./Event";

export class Notification {
    readonly type: EventType;
    readonly message: string;

    constructor(type: EventType, message: string) {
        this.type = type;
        this.message = message;
    }
}
