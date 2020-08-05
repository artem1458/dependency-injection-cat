export function isPathRelative(path: string): boolean {
    return /^\.?\.\//.test(path);
}
