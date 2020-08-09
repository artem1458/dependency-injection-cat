import { filter, map } from 'lodash';
import { IRegisterTypeProps, ITypeInfo } from './types';
import { FactoryIdRepository } from '../factories/FactoryIdRepository';

export class TypeRegisterRepository {
    static repository: Record<string, ITypeInfo | undefined> = {};

    static registerType({ typeId, originalTypeName, configPath, configName, beanName }: IRegisterTypeProps): void {
        if (TypeRegisterRepository.hasTypeInRegister(typeId)) {
            const { originalName } = TypeRegisterRepository.getTypeById(typeId);
            throw new Error(`It seems like you define config for type ${originalName} more than one time`);
        }

        const typeInfo: ITypeInfo = {
            id: typeId,
            configPath,
            originalName: originalTypeName,
            configId: FactoryIdRepository.getFactoryId(configPath),
            factoryName: configName,
            beanName,
        }

        TypeRegisterRepository.repository[typeId] = typeInfo;
    }

    static hasTypeInRegister(typeId: string): boolean {
        return TypeRegisterRepository.repository[typeId] !== undefined;
    }

    static checkTypeInRegister(typeId: string): void {
        if (!TypeRegisterRepository.hasTypeInRegister(typeId)) {
            throw new Error(`It seems like you forgot to define config for Type ${typeId}`); //TODO ADD TYPE NAME
        }
    }

    static getTypesByFactoryId(factoryId: string): ITypeInfo[] {
        const types = map(TypeRegisterRepository.repository, it => it);

        return filter(types, (value): value is ITypeInfo => value?.configId === factoryId);
    }

    static getTypeById(typeId: string): ITypeInfo {
        TypeRegisterRepository.checkTypeInRegister(typeId);

        return TypeRegisterRepository.repository[typeId]!;
    }

    static clearRepository(): void {
        TypeRegisterRepository.repository = {};
    }
}
