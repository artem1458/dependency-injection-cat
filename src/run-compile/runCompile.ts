import { ProgramRepository } from '../program/ProgramRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';
import { registerTypes } from '../type-register/registerTypes';
import { registerDependencies } from '../types-dependencies-register/registerDependencies';
import { createFactories } from '../factories/createFactories';
import { SourceFilesCache } from '../core/internal/ts-helpers/node-source-descriptor/SourceFilesCache';
import { PathResolverCache } from '../core/internal/ts-helpers/path-resolver/PathResolverCache';

export const runCompile = (): void => {
    TypeRegisterRepository.clearRepository();
    TypeDependencyRepository.clearRepository();
    SourceFilesCache.clearCache();
    PathResolverCache.clearCache();
    ProgramRepository.initProgram();

    registerTypes();
    registerDependencies();
    createFactories();
};
