import { ProgramRepository } from '../program/ProgramRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';
import { registerTypes } from '../type-register/registerTypes';
import { registerDependencies } from '../types-dependencies-register/registerDependencies';
import { createFactories } from '../factories/createFactories';

export const runCompile = (): void => {
    TypeRegisterRepository.clearRepository();
    TypeDependencyRepository.clearRepository();
    ProgramRepository.initProgram();

    registerTypes();
    registerDependencies();
    createFactories();
};
