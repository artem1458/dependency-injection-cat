import fs from 'fs';
import * as ts from 'typescript';
import { CompilerOptionsProvider } from '../../../../compiler-options-provider/CompilerOptionsProvider';

export class SourceFilesCache {
    private static cache: Record<string, ts.SourceFile | undefined> = {};

    static getSourceFileByPath(filePath: string): ts.SourceFile {
        const cached = this.cache[filePath];

        if (cached === undefined) {
            const fileText = fs.readFileSync(filePath, 'utf-8');
            const sourceFile = ts.createSourceFile(
                filePath,
                fileText,
                CompilerOptionsProvider.options.target ?? ts.ScriptTarget.ES2015,
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
