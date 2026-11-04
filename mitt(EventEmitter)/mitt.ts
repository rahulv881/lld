import assert from 'node:assert/strict';

export type EventType = string | symbol;
export type Handler<T = unknown> = (payload: T) => void;
export type WildcardHandler<E extends Record<EventType, unknown>> = <K extends keyof E>(
  type: K,
  payload: E[K]
) => void;

export type HandlerStore<E extends Record<EventType, unknown>> = Map<
  keyof E | '*',
  Array<Handler<any> | WildcardHandler<E>>
>;

export interface Emitter<E extends Record<EventType, unknown>> {
  all: HandlerStore<E>;
  on<K extends keyof E>(type: K, handler: Handler<E[K]>): void;
  on(type: '*', handler: WildcardHandler<E>): void;
  off<K extends keyof E>(type: K, handler?: Handler<E[K]>): void;
  off(type: '*', handler?: WildcardHandler<E>): void;
  emit<K extends keyof E>(type: K, ...payload: undefined extends E[K] ? [E[K]?] : [E[K]]): void;
}

export function createEmitter<E extends Record<EventType, unknown>>(
  all: HandlerStore<E> = new Map()
): Emitter<E> {
  return {
    all,

    on(type: any, handler: any) {
      const list = all.get(type);
      if (list) list.push(handler);
      else all.set(type, [handler]);
    },

    off(type: any, handler?: any) {
      const list = all.get(type);
      if (!list) return;
      if (!handler) {
        all.set(type, []);
        return;
      }
      // remove one occurrence (the most recently added), like mitt
      const i = list.lastIndexOf(handler);
      if (i > -1) list.splice(i, 1);
    },

    emit(type: any, ...rest: any[]) {
      const payload = rest[0];
      // snapshot: handlers may call off() on themselves mid-emit
      (all.get(type) ?? []).slice().forEach((h: any) => h(payload));
      (all.get('*') ?? []).slice().forEach((h: any) => h(type, payload));
    },
  };
}

// ---------------------------------------------------------------- checks
type Events = {
  login: { user: string };
  logout: undefined;
  count: number;
};

// 1. same handler registered twice fires twice
{
  const e = createEmitter<Events>();
  let n = 0;
  const h = () => void n++;
  e.on('count', h);
  e.on('count', h);
  e.emit('count', 1);
  assert.equal(n, 2);
}

// 2. off for never-registered handler / type doesn't throw
{
  const e = createEmitter<Events>();
  assert.doesNotThrow(() => e.off('login', () => {}));
  assert.doesNotThrow(() => e.off('login'));
  e.on('login', () => {});
  assert.doesNotThrow(() => e.off('login', () => {}));
  assert.equal(e.all.get('login')!.length, 1);
}

// 3. wildcard runs after type-specific
{
  const e = createEmitter<Events>();
  const order: string[] = [];
  e.on('*', (t, p) => order.push(`*:${String(t)}:${JSON.stringify(p)}`));
  e.on('login', () => order.push('specific'));
  e.emit('login', { user: 'a' });
  assert.deepEqual(order, ['specific', '*:login:{"user":"a"}']);
}

// 4. self-removal during emit doesn't skip siblings
{
  const e = createEmitter<Events>();
  const calls: string[] = [];
  const a = () => {
    calls.push('a');
    e.off('count', a);
  };
  const b = () => calls.push('b');
  e.on('count', a);
  e.on('count', b);
  e.emit('count', 1);
  assert.deepEqual(calls, ['a', 'b']);
  e.emit('count', 2);
  assert.deepEqual(calls, ['a', 'b', 'b']);
}

// 5. off(type) clears all; `all` is inspectable/clearable
{
  const e = createEmitter<Events>();
  let n = 0;
  e.on('count', () => n++);
  e.on('count', () => n++);
  e.off('count');
  e.emit('count', 1);
  assert.equal(n, 0);
  e.on('count', () => n++);
  e.all.clear();
  e.emit('count', 1);
  assert.equal(n, 0);
}

// 6. payload-less events
{
  const e = createEmitter<Events>();
  let hit = false;
  e.on('logout', () => (hit = true));
  e.emit('logout');
  assert.ok(hit);
}

// ---- type-level checks (compile errors if these stop erroring) ----
{
  const e = createEmitter<Events>();
  // @ts-expect-error unknown event
  e.on('nope', () => {});
  // @ts-expect-error wrong payload type
  e.emit('count', 'x');
  // @ts-expect-error payload required
  e.emit('login');
  // @ts-expect-error handler payload mismatch
  e.on('count', (p: string) => {});
}

console.log('all checks passed');
