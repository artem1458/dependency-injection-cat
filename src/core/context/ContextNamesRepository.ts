export class ContextNamesRepository {
    static nameToPath = new Map<string, string>();
    static pathToName = new Map<string, string>();

    static clear(): void {
        this.nameToPath.clear();
        this.pathToName.clear();
    }
}
