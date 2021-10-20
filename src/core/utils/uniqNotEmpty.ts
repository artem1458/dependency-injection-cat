export function uniqNotEmpty<T>(list: (T | undefined | null)[]): T[] {
    return Array.from(new Set(list)).filter((it): it is T => Boolean(it));
}
