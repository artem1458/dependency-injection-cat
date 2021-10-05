export class ExtendedSet<T = unknown> extends Set<T> {
    empty(): boolean {
        return this.size === 0;
    }

    list(): T[] {
        return Array.from(this);
    }
}
