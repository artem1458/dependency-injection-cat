import path from 'path';
import { createMatchPath, MatchPath, loadConfig } from 'tsconfig-paths';
import { ProgramRepository } from '../program/ProgramRepository';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';
import { isPathRelative } from '../utils/isPathRelative';

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        if (!ShouldReinitializeRepository.value) {
            return;
        }
        const tsConfigPath = ProgramRepository.program.getCompilerOptions().configFilePath as string;
        const config = loadConfig(tsConfigPath);

        if (config.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        PathResolver.resolver = createMatchPath(config.absoluteBaseUrl, config.paths);
    }

    static resolve(sourceFilePath: string, targetPath: string): string {
        if (isPathRelative(targetPath)) {
            const newSourceFilePath = path.dirname(sourceFilePath);
            return path.resolve(newSourceFilePath, targetPath);
        }

        return PathResolver.resolver(targetPath) ?? targetPath;
    }
}
