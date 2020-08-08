import * as ts from 'typescript';
import { ShouldReinitializeRepository } from './ShouldReinitializeRepository';
import { FactoryIdRepository } from '../factories/FactoryIdRepository';
import { DiConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';

export const afterTransformerHelper = (): ts.TransformerFactory<ts.SourceFile> => {
    return context => sourceFile => {
        FactoryIdRepository.clearRepository();
        DiConfigRepository.clearRepository();
        TypeRegisterRepository.clearRepository();
        TypeDependencyRepository.clearRepository();
        ShouldReinitializeRepository.value = true;

        return sourceFile;
    }
}

