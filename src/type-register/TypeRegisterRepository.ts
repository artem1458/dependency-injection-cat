import { uuid } from '../utils/uuid';
import { ITypeInfo } from './ITypeInfo';
import { FactoryIdRepository } from '../factories/FactoryIdRepository';

export class TypeRegisterRepository {
    static repository: Record<string, ITypeInfo | undefined> = {};
    private static parseKey(key: string): { typeName: string, filePath: string } {
        const parsedKeys = key.startsWith('"')
            ? key.slice(1).split('"')
            : key.split('"');

        return {
            filePath: parsedKeys[0],
            typeName: parsedKeys[1].slice(1),
        }
    }

    static registerType(typeId: string, configId: string, configName: string, beanName: string): void {
        if (TypeRegisterRepository.hasTypeInRegister(typeId)) {
            const { typeName, filePath } = TypeRegisterRepository.parseKey(typeId);
            throw new Error(`It seems like you define config for type ${typeName} more than one time, path ${filePath}`);
        }

        const typeInfo: ITypeInfo = {
            id: uuid(),
            configId: FactoryIdRepository.getFactoryId(configId),
            configName,
            beanName,
        }

        TypeRegisterRepository.repository[typeId] = typeInfo;
    }

    static hasTypeInRegister(key: string): boolean {
        return TypeRegisterRepository.repository[key] !== undefined;
    }

    static checkTypeInRegister(key: string): void {
        if (!TypeRegisterRepository.hasTypeInRegister(key)) {
            const { typeName, filePath } = TypeRegisterRepository.parseKey(key);
            throw new Error(`It seems like you forgot to define config for Type ${typeName}, Path ${filePath}`);
        }
    }
}
