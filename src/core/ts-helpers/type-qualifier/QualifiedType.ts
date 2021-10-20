import ts from 'typescript';
import { ExtendedSet } from '../../utils/ExtendedSet';

export enum QualifiedTypeKind {
    PLAIN = 'PLAIN',
    LIST = 'LIST',
}

export class QualifiedType {
    public kind: QualifiedTypeKind = QualifiedTypeKind.PLAIN;
    public declare typeIds: ExtendedSet<string>;
    public declare fullTypeId: string;
    public declare typeNode: ts.TypeNode;
}
