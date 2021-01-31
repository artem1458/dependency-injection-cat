export function removeQuotesFromString(str: string): string {
    if (/^'.*'$/.test(str) || /^".*"$/.test(str)) {
        return str.slice(1, -1);
    }

    throw new Error(`removeQuotesFromString error ${str}`);
}
