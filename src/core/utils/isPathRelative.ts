const relativeRegexp = /^\.\.?($|[\\/])/;

export function isPathRelative(filePath: string): boolean {
    return relativeRegexp.test(filePath);
}
