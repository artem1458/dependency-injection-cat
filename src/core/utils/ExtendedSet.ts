export class ExtendedSet<T = unknown> {
    private readonly set: Set<T>;

    constructor(values?: readonly T[] | null) {
        this.set = new Set<T>(values);
    }

    firstOrNull(): T | null {
        return this.list()[0] ?? null;
    }

    list(): T[] {
        return Array.from(this);
    }

    get[Symbol.toStringTag](): string {
        return this.set[Symbol.toStringTag];
    }

    get size(): number {
        return this.set.size;
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.set[Symbol.iterator]();
    }

    add(value: T): this {
        this.set.add(value);

        return this;
    }

    clear(): void {
        this.set.clear();
    }

    delete(value: T): boolean {
        return this.set.delete(value);
    }

    entries(): IterableIterator<[T, T]> {
        return this.set.entries();
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        this.set.forEach(callbackfn, thisArg);
    }

    has(value: T): boolean {
        return this.set.has(value);
    }

    keys(): IterableIterator<T> {
        return this.set.keys();
    }

    values(): IterableIterator<T> {
        return this.set.values();
    }
}
