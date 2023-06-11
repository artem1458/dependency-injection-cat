import ts, { TypeFlags } from 'typescript';
import { DIType } from '../di-type/DIType';
import { get } from 'lodash';
import { parseFlags } from './parseFlags';
import { DITypeFlag } from '../di-type/DITypeFlag';
import { DeclarationInfo } from '../di-type/DeclarationInfo';

/**
 * notes:
 * If hasNoDefaultLib is true in source file - that means source file is lib file
 *
 * Type diagram https://user-images.githubusercontent.com/442988/78500144-86799400-775d-11ea-8e2b-52feeec6d39f.png
 * */

export class DITypeBuilder {
    static build(tsType: ts.Type, typeChecker: ts.TypeChecker): DIType {
        const diType = new DIType();

        this.setTSFlags(diType, tsType);
        this.setTypeFlag(diType);
        this.trySetConstantValue(diType, tsType);
        this.trySetTypeArguments(diType, tsType, typeChecker);
        this.setUnionOrIntersectionElements(diType, tsType, typeChecker);
        this.trySetDeclarationInfo(diType, tsType);

        return diType;
    }

    private static setTSFlags(diType: DIType, tsType: ts.Type): void {
        diType.tsTypeFlags = tsType.getFlags();
        diType.parsedTSTypeFlags = new Set(parseFlags(ts.TypeFlags, tsType.getFlags()));

        if (Object.hasOwn(tsType, 'objectFlags')) {
            const objectFlags = (tsType as ts.ObjectType).objectFlags;

            diType.tsObjectFlags = objectFlags;
            diType.parsedTSObjectFlags = new Set(parseFlags(ts.ObjectFlags, objectFlags));
        }
    }

    private static setTypeFlag(diType: DIType): void {
        switch (true) {
        case diType.parsedTSTypeFlags.has(TypeFlags.Any):
            diType.typeFlag = DITypeFlag.ANY;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Unknown):
            diType.typeFlag = DITypeFlag.UNKNOWN;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Never):
            diType.typeFlag = DITypeFlag.NEVER;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Void):
            diType.typeFlag = DITypeFlag.VOID;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Undefined):
            diType.typeFlag = DITypeFlag.UNDEFINED;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Null):
            diType.typeFlag = DITypeFlag.NULL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.String) && !diType.parsedTSTypeFlags.has(TypeFlags.StringLiteral) && !diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.STRING;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Number) && !diType.parsedTSTypeFlags.has(TypeFlags.NumberLiteral) && !diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.NUMBER;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Boolean) && !diType.parsedTSTypeFlags.has(TypeFlags.BooleanLiteral):
            diType.typeFlag = DITypeFlag.BOOLEAN;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.EnumLiteral) && diType.parsedTSTypeFlags.has(TypeFlags.Union) && diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.ENUM;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.BigInt) && !diType.parsedTSTypeFlags.has(TypeFlags.BigIntLiteral):
            diType.typeFlag = DITypeFlag.BIGINT;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.StringLiteral) && !diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.STRING_LITERAL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.NumberLiteral) && !diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.NUMBER_LITERAL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.BooleanLiteral):
            diType.typeFlag = DITypeFlag.BOOLEAN_LITERAL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.EnumLiteral) && diType.parsedTSTypeFlags.has(TypeFlags.StringOrNumberLiteral) && diType.parsedTSTypeFlags.has(TypeFlags.EnumLike):
            diType.typeFlag = DITypeFlag.ENUM_LITERAL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.BigIntLiteral):
            diType.typeFlag = DITypeFlag.BIGINT_LITERAL;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Object):
            diType.typeFlag = DITypeFlag.OBJECT;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Union):
            diType.typeFlag = DITypeFlag.UNION;
            break;
        case diType.parsedTSTypeFlags.has(TypeFlags.Intersection):
            diType.typeFlag = DITypeFlag.INTERSECTION;
            break;
        }
    }

    private static trySetConstantValue(diType: DIType, tsType: ts.Type): void {
        switch (diType.typeFlag) {
        case DITypeFlag.STRING_LITERAL:
        case DITypeFlag.NUMBER_LITERAL:
        case DITypeFlag.BIGINT_LITERAL:
            diType.constantValue = get(tsType, 'value', undefined);
            break;
        case DITypeFlag.BOOLEAN_LITERAL:
            diType.constantValue = get(tsType, 'intrinsicName', undefined) === 'true';
            break;
        case DITypeFlag.ENUM_LITERAL:
            diType.constantValue = get(tsType, 'value', undefined);
            break;
        default:
            return;
        }
    }

    private static trySetTypeArguments(diType: DIType, tsType: ts.Type, typeChecker: ts.TypeChecker): void {
        if (!diType.isObject) {
            return;
        }

        const typeArguments = tsType.aliasTypeArguments ?? get(tsType, 'resolvedTypeArguments', []) as ts.Type[];

        typeArguments.forEach(it => {
            const typeArgument = this.build(it, typeChecker);

            diType.typeArguments.push(typeArgument);
        });
    }

    private static setUnionOrIntersectionElements(diType: DIType, tsType: ts.Type, typeChecker: ts.TypeChecker): void {
        if (!diType.isUnionOrIntersection) {
            return;
        }

        const types = (tsType as ts.UnionOrIntersectionType).types ?? [];

        types.forEach(it => {
            const type = this.build(it, typeChecker);

            diType.unionOrIntersectionTypes.push(type);
        });
    }

    private static trySetDeclarationInfo(diType: DIType, tsType: ts.Type): void {
        if (!diType.isObject) {
            return;
        }

        const symbol = tsType.aliasSymbol ?? tsType.getSymbol();

        if (!symbol) {
            return;
        }

        const declarations = symbol.getDeclarations() ?? [];

        declarations.forEach(it => {
            const declarationInfo = new DeclarationInfo();
            const {
                fileName,
                hasNoDefaultLib,
            } = it.getSourceFile();
            const modifiers = (ts.canHaveModifiers(it) ? ts.getModifiers(it) : undefined) ?? [];

            declarationInfo.fileName = fileName;
            declarationInfo.isFromDefaultLib = hasNoDefaultLib;
            declarationInfo.isExported = modifiers.some(it => it.kind === ts.SyntaxKind.ExportKeyword);
            declarationInfo.isDefaultExported = modifiers.some(it => declarationInfo.isExported && it.kind === ts.SyntaxKind.DefaultKeyword);

            if (declarationInfo.isDefaultExported) {
                declarationInfo.name = 'default';
            } else {
                const declarationName = (it as ts.NamedDeclaration).name ?? null;

                declarationInfo.name = declarationName && ts.isIdentifier(declarationName) && declarationName.getText() || null;
            }

            let parent: ts.Node = it.parent;
            let moduleName = '';

            while (!ts.isSourceFile(parent)) {
                if (ts.isModuleDeclaration(parent)) {
                    moduleName = `${parent.name.getText()}.${moduleName}`;
                }

                parent = parent.parent;
            }

            declarationInfo.moduleName = moduleName || null;

            diType.addDeclaration(declarationInfo);
        });
    }
}
