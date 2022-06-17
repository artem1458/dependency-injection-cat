import * as ts from 'typescript';
import { FileSystem } from '../../../file-system/FileSystem';

export class SourceFilesCache {
    private static cache: Record<string, ts.SourceFile | undefined> = {};

    static getSourceFileByPath(filePath: string): ts.SourceFile {
        const cached = this.cache[filePath];

        if (cached === undefined) {
            const fileText = FileSystem.readFile(filePath);
            const sourceFile = ts.createSourceFile(
                filePath,
                fileText,
                ts.ScriptTarget.Latest,
                true,
            );
            this.cache[filePath] = sourceFile;

            return sourceFile;
        }

        return cached;
    }

    static clearCache(): void {
        this.cache = {};
    }
}
