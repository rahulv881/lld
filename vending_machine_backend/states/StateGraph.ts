import type { StateDefinition } from "./StateDefinition";

/** Registry of state definitions plus the allowed-transition graph derived from them. */
export class StateGraph {
    private readonly definitions = new Map<string, StateDefinition>();
    private readonly edges = new Map<string, Set<string>>();

    constructor(definitions: readonly StateDefinition[]) {
        for (const definition of definitions) {
            if (this.definitions.has(definition.status)) throw new Error(`Duplicate state ${definition.status}`);
            this.definitions.set(definition.status, definition);
            this.edges.set(definition.status, new Set());
        }
        for (const definition of definitions) {
            for (const to of definition.transitions) this.link(definition.status, to);
            for (const from of definition.enteredFrom ?? []) this.link(from, definition.status);
        }
    }

    definition(status: string): StateDefinition {
        const definition = this.definitions.get(status);
        if (!definition) throw new Error(`Unknown state ${status}`);
        return definition;
    }

    assertAllowed(from: string, to: string): void {
        if (!this.edges.get(from)?.has(to)) throw new Error(`Illegal transition ${from} -> ${to}`);
    }

    private link(from: string, to: string): void {
        const outgoing = this.edges.get(from);
        if (!outgoing || !this.definitions.has(to)) throw new Error(`Transition ${from} -> ${to} names an unknown state`);
        outgoing.add(to);
    }
}
