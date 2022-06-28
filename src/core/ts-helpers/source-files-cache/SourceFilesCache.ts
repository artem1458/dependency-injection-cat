import * as ts from 'typescript';
import { FileSystem } from '../../../file-system/FileSystem';

export class SourceFilesCache {
    private static cache = new Map<string, ts.SourceFile>();

    static getSourceFileByPath(filePath: string): ts.SourceFile {
        const cached = this.cache.get(filePath) ?? null;

        if (cached === null) {
            const fileText = FileSystem.readFile(filePath);
            const sourceFile = ts.createSourceFile(
                filePath,
                fileText,
                ts.ScriptTarget.Latest,
                true,
            );
            this.cache.set(filePath, sourceFile);

            return sourceFile;
        }

        return cached;
    }

    static clear(): void {
        this.cache.clear();
    }

    static clearByPath(path: string): void {
        this.cache.delete(path);
    }
}
