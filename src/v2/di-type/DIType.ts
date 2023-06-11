import ts from 'typescript';
import { DeclarationInfo } from './DeclarationInfo';
import { TypeCompatibilityMatrix } from './TypeCompatibilityMatrix';
import { DITypeFlag } from './DITypeFlag';
import { escape } from 'lodash';

//TODO add text node from where this type was extracted
//TODO check for anonymous types
export class DIType {
    private cachedId: string | null = null;

    get id(): string {
        if (!this.cachedId) {
            this.cachedId = this.generateId();
        }

        return this.cachedId;
    }

    private generateId(): string {
        /**
         * tf - type flag
         * cvt - constant value type
         * cv - constant value
         * d - declarations
         * ta - type arguments
         * u - union
         * i - intersection
         * */
        const typeFlag = this.typeFlag.toString();
        const constantValueType = typeof this.constantValue;
        const constantValue = this.constantValue?.toString() ?? '';
        const declarations = this.declarations.map(it => `<d>${it.toString()}</d>`).join('');
        const typeArguments = this.typeArguments.map(it => `<ta>${it.id}</ta>`).join('');
        const unionOrIntersectionTypes = this.unionOrIntersectionTypes.map(it => {
            const tag = this.typeFlag === DITypeFlag.UNION ? 'u' : 'i';
            return `<${tag}>${it.id}</${tag}>`;
        }).join();

        return `<tf>${escape(typeFlag)}</tf>` +
            `<cvt>${constantValueType}</cvt>` +
            `<cv>${escape(constantValue)}</cv>` +
            `${declarations}` +
            `${typeArguments}` +
            `${unionOrIntersectionTypes}`;
    }

    declare tsTypeFlags: ts.TypeFlags;
    declare parsedTSTypeFlags: Set<ts.TypeFlags>;

    tsObjectFlags: ts.ObjectFlags | null = null;
    parsedTSObjectFlags = new Set<ts.ObjectFlags>();

    typeFlag: DITypeFlag = DITypeFlag.UNSUPPORTED;

    constantValue: unknown = undefined;

    typeArguments: DIType[] = [];
    unionOrIntersectionTypes: DIType[] = [];

    declarations: DeclarationInfo[] = [];

    addDeclaration(declaration: DeclarationInfo): void {
        this.declarations.push(declaration);
        this.declarations.sort((a, b) => a.compareTo(b));
    }

    get isPrimitive(): boolean {
        return this.typeFlag >= DITypeFlag.ANY && this.typeFlag <= DITypeFlag.BIGINT;
    }

    get isLiteral(): boolean {
        return this.typeFlag >= DITypeFlag.STRING_LITERAL && this.typeFlag <= DITypeFlag.BIGINT_LITERAL;
    }

    get isObject(): boolean {
        return this.typeFlag === DITypeFlag.OBJECT;
    }

    get isUnion(): boolean {
        return this.typeFlag === DITypeFlag.UNION;
    }

    get isIntersection(): boolean {
        return this.typeFlag === DITypeFlag.INTERSECTION;
    }

    get isUnionOrIntersection(): boolean {
        return this.isUnion || this.isIntersection;
    }

    isCompatible(to: DIType): boolean {
        if (this.id === to.id) {
            return true;
        }

        //If both are primitive types - we can stop here
        if (this.isPrimitive && (to.isPrimitive || to.isLiteral)) {
            return TypeCompatibilityMatrix.isCompatible(this.typeFlag, to.typeFlag);
        }

        //If this is literal type, and other as well we can stop here
        if (this.isLiteral && this.typeFlag === to.typeFlag && this.constantValue !== undefined) {
            if (this.typeFlag === DITypeFlag.BIGINT_LITERAL) {
                const thisValue = this.constantValue as ts.PseudoBigInt;
                const otherValue = to.constantValue as ts.PseudoBigInt;

                return thisValue.negative === otherValue.negative && thisValue.base10Value === otherValue.base10Value;
            }

            return this.constantValue === to.constantValue;
        }

        //Unions and intersections
        if (to.isUnion) {
            //TODO report compilation error
            return false;
        }

        if (to.isIntersection) {
            return to.unionOrIntersectionTypes.some(it => this.isCompatible(it));
        }

        if (this.isUnion && to.isIntersection) {
            return this.unionOrIntersectionTypes.some(it => {
                return to.unionOrIntersectionTypes.some(toType => it.isCompatible(toType));
            });
        }

        if (this.isUnion) {
            return this.unionOrIntersectionTypes.some(it => it.isCompatible(to));
        }

        if (this.isIntersection && to.isIntersection) {
            return this.unionOrIntersectionTypes.every(it => {
                return to.unionOrIntersectionTypes.some(toIt => it.isCompatible(toIt));
            });
        }

        //Objects
        if (this.isObject) {
            if (this.declarations.length === 0) {
                //TODO report compilation error
                return false;
            }

            if (this.declarations.length !== to.declarations.length) {
                return false;
            }

            if (!this.declarations.every((it, index) => it.equals(to.declarations[index]))) {
                return false;
            }

            if (this.typeArguments.length !== to.typeArguments.length) {
                return false;
            }

            return this.typeArguments.every((it, index) => {
                return it.isCompatible(to.typeArguments[index]);
            });
        }

        return false;
    }
}
