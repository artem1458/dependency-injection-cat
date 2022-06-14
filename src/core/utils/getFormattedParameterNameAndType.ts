import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { unquoteString } from './unquoteString';

export const getFormattedParameterNameAndType = (name: string, type: QualifiedType): string =>
    `${name}: ${unquoteString(type.typeNode.getText())}`;
