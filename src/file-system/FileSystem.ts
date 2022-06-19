import fs from 'fs';
import upath from 'upath';
import { globAsync } from './utils';
import minimatch from 'minimatch';

type FSMode = 'node_fs' | 'virtual_fs'

export class FileSystem {
    private static mode: FSMode = 'node_fs';
    private static data = new Map<string, string>();

    static async initVirtualFS(): Promise<void> {
        const projectFiles = await globAsync('**/*', {
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
            ],
            absolute: true,
        });

        await Promise.all(projectFiles.map(async filePath => {
            const fileContent = await this.readFileAsync(filePath);

            if (fileContent !== null) {
                this.data.set(filePath, fileContent);
            }
        }));
    }

    static setMode(mode: FSMode): void {
        this.mode = mode;
    }

    static clearFS(): void {
        if (this.mode === 'node_fs') {
            throw new Error('Can not clear node_fs');
        } else {
            this.data.clear();
        }
    }

    static deleteFile(path: string): void {
        const normalizedPath = this.toUPath(path);

        if (this.mode === 'virtual_fs') {
            this.data.delete(normalizedPath);
        }
    }

    static writeFile(path: string, content: string): void {
        const normalizedPath = this.toUPath(path);

        if (this.mode === 'node_fs') {
            fs.writeFileSync(normalizedPath, content);
        } else {
            this.data.set(normalizedPath, content);
        }
    }

    static exists(path: string): boolean {
        const normalizedPath = this.toUPath(path);

        if (this.mode === 'node_fs' || this.isFromNodeModules(normalizedPath)) {
            return fs.existsSync(normalizedPath);
        } else {
            return this.data.has(normalizedPath);
        }
    }

    static readFile(path: string): string {
        const normalizedPath = this.toUPath(path);

        if (this.mode === 'node_fs' || this.isFromNodeModules(normalizedPath)) {
            return fs.readFileSync(normalizedPath, {encoding: 'utf-8'});
        } else {
            const fileContent = this.data.get(normalizedPath) ?? null;

            if (fileContent === null) {
                throw new Error('File not found in virtual FS');
            }

            return fileContent;
        }
    }

    private static toUPath(path: string): string {
        return upath.normalize(path);
    }

    private static isFromNodeModules(path: string): boolean {
        return minimatch(path, '**/node_modules/**');
    }

    private static async readFileAsync(filePath: string): Promise<string | null> {
        const stats = await fs.promises.stat(filePath);

        if (stats.isFile()) {
            return fs.promises.readFile(filePath, { encoding: 'utf-8' });
        }

        return null;
    }
}
