export function parseString(str: string): string {
    if (/^'.*'$/.test(str) || /^".*"$/.test(str)) {
        return str.slice(1, -1);
    }

    throw new Error(`parseString error ${str}`);
}
