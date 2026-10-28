class Node {
    key: string;
    value: string;
    prev: Node | null = null;
    next: Node | null = null;

    constructor(key: string, value: string){
        this.key = key;
        this.value = value;
    }
}

export class LRU{

    // * Assuming:
    // * 1. Keys will be unique
    // * 2. The time complexity will be O(1) average

    private capacity: number;
    private size = 0;
    // * Plain object (no prototype) used as the hash table: key -> node, Get O(1)
    private nodes: Record<string, Node> = Object.create(null);
    // * Doubly linked list ordered by recency, Put O(1)
    // * Sentinels: head.next is the most recently used, tail.prev is the least recently used
    private head = new Node("", "");
    private tail = new Node("", "");

    constructor(capacity: number){
        this.capacity = capacity;
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    public put(key: string, value: string){
        
        const existing = this.nodes[key];
        if(existing){
            existing.value = value;
            // * Push this value to front
            this.moveToFront(existing);
            return ; // * MISSING EARLIER
        }
        else {
            const node = new Node(key,value);
            this.insertFront(node);
            this.size++;
            // * Add node to hash/map/object
            this.nodes[key] = node;
        }

        // * Remove last (not first) element
        if(this.size > this.capacity){
            const lru = this.tail.prev;
            if(lru && lru != this.head){
                this.unlink(lru);
                delete this.nodes[lru.key]; // * MISSING
                this.size--;
            }
        }

    }

    public get(key: string): string | undefined {
        const exists = this.nodes[key];
        if(!exists) return undefined;
        this.moveToFront(exists); // * MISSING EARLIER
        return exists.value;
    }

    private unlink(node: Node){
        const prev = node.prev;
        const next = node.next;
        if(prev){
            // if(next) prev.next = next.next; // * WRONG
            // else prev.next = null; // * WRONG
            prev.next = next;
        }
        if(next){
            // if(prev) next.prev = prev // * WRONG
            // else next.prev = null; // * WRONG
            next.prev = prev;
        }

        node.next = null;
        node.prev = null;
    }

    private insertFront(node: Node){
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        if(next) next.prev = node;
        node.next = next;
    }

    private moveToFront(node: Node){
        this.unlink(node);
        this.insertFront(node);
    }

}
