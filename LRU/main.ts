import { LRU } from ".";

(() => {
    // * TODO: 1. put(key, value): Insert a key-value pair into the cache. If the cache is at capacity, remove the least recently used item before inserting the new item.
    let capacity = 10;
    const lru = new LRU(capacity);
    let i=0;
    while(i<=10) {lru.put(i.toString(),i.toString());i++}

    i=0;
    while(i<=10){ console.log(lru.get(i.toString())); i++; }

})()