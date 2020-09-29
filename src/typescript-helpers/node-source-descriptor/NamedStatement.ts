import * as ts from 'typescript';
import { get } from 'lodash';

export interface NamedStatement extends ts.Statement {
    name: ts.Identifier;

}

export function isNamedStatement(node: ts.Statement): node is NamedStatement {
    return get(node, 'name') !== undefined;
}
