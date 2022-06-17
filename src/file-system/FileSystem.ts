import fs from 'fs';

type FSMode = 'node_fs' | 'virtual_fs'

export class FileSystem {
    private static mode: FSMode = 'node_fs';
    private static data: Map<string, string>;

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
        if (this.mode === 'node_fs') {
            fs.rmSync(path);
        } else {
            this.data.delete(path);
        }
    }

    static writeFile(path: string, content: string): void {
        if (this.mode === 'node_fs') {
            fs.writeFileSync(path, content);
        } else {
            this.data.set(path, content);
        }
    }

    static exists(path: string): boolean {
        if (this.mode === 'node_fs') {
            return fs.existsSync(path);
        } else {
            return this.data.has(path);
        }
    }

    static readFile(path: string): string {
        if (this.mode === 'node_fs') {
            return fs.readFileSync(path, {encoding: 'utf-8'});
        } else {
            const fileContent = this.data.get(path);

            if (!fileContent) {
                throw new Error('File not found in virtual FS');
            }

            return fileContent;
        }
    }
}
