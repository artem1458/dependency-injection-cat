import ts from 'typescript';
import { ExtendedSet } from '../../utils/ExtendedSet';

export enum QualifiedTypeEnum {
    PLAIN = 'PLAIN',
    LIST = 'LIST',
}

export class QualifiedType {
    public typeIds = new ExtendedSet<string>();
    public kind: QualifiedTypeEnum = QualifiedTypeEnum.PLAIN;
    public declare typeNode: ts.TypeNode;
}
