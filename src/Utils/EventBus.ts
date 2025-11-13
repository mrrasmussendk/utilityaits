export type Type<T> = new (...args: any[]) => T;

export class EventBus {
    private readonly latest = new Map<symbol | Function, unknown>();

    publish<T>(key: Type<T> | symbol, msg: T): void {
        this.latest.set(key, msg as unknown);
    }

    /**
     * Try to get the latest message for a given key.
     * Returns a tuple like C#'s TryGet: [found, valueIfFound]
     */
    tryGet<T>(key: Type<T> | symbol): [true, T] | [false, undefined] {
        if (this.latest.has(key)) {
            return [true, this.latest.get(key) as T];
        }
        return [false, undefined];
    }

    /** Get the latest message for a given key or undefined if none. */
    getOrDefault<T>(key: Type<T> | symbol): T | undefined {
        return this.latest.get(key) as T | undefined;
    }

}

/** Helper to create a unique key when you don’t have a class type. */
export function createEventKey<T>(description?: string): symbol {
    return Symbol(description);
}
