import { EventType } from "./Event";
import { Notification } from "./Notification";

const EVENT_LIMIT = 16;

/** Latest display message plus a capped, newest-first list of notifications. */
export class EventLog {
    message = "Select a product.";
    private readonly events: Notification[] = [];

    notify(type: EventType, message: string): void {
        this.message = message;
        this.events.unshift(new Notification(type, message));
        if (this.events.length > EVENT_LIMIT) this.events.length = EVENT_LIMIT;
    }

    list(): { type: string; message: string }[] {
        return this.events.map((event) => ({ type: event.type, message: event.message }));
    }
}
