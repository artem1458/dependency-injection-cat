import { uuid } from '../utils/uuid';

export class TypeRegisterRepository {
    private static repository: Record<string, string | undefined> = {};
    private static parseKey(key: string): { typeName: string, filePath: string } {
        const parsedKeys = key.startsWith('"')
            ? key.slice(1).split('"')
            : key.split('"');

        return {
            filePath: parsedKeys[0],
            typeName: parsedKeys[1].slice(1),
        }
    }

    static registerType(key: string): void {
        if (TypeRegisterRepository.hasTypeInRegister(key)) {
            const { typeName, filePath } = TypeRegisterRepository.parseKey(key);
            throw new Error(`It seems like you define config for type ${typeName} more than one time, path ${filePath}`);
        }

        TypeRegisterRepository.repository[key] = uuid();
    }

    static getTypeId(key: string): string {
        const id = TypeRegisterRepository.repository[key];

        if (id !== undefined) {
            return id;
        }

        this.checkTypeInRegister(key);
        return '';
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
