import { flatten } from 'lodash';
import { ITypeInfo } from '../../type-register/ITypeInfo';
import { TypeRegisterRepository } from '../../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../../types-dependencies-register/TypeDependencyRepository';

export function getFactoryDependencies(factoryId: string): ITypeInfo[] {
    const factoryTypes = TypeRegisterRepository.getTypesByFactoryId(factoryId).map(it => it.id);
    const dependencies = flatten(factoryTypes.map(it => TypeDependencyRepository.getDependencies(it)));

    return dependencies
        .map(it => TypeRegisterRepository.getTypeById(it))
        .filter(it => it.factoryId !== factoryId);
}
