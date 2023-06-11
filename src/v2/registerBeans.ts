import ts from 'typescript';
import { isPropertyBean } from './utils/isPropertyBean';
import { DIType } from './di-type/DIType';
import { DITypeBuilder } from './utils/DITypeBuilder';
import { chunk } from 'lodash';

export const registerBeans = (context: ts.ClassDeclaration, program: ts.Program): void => {
    const typeChecker = program.getTypeChecker();
    const diTypes: [string, DIType][] = [];

    context.members.forEach(member => {
        if (isPropertyBean(member, program)) {
            const propertyType = typeChecker.getTypeAtLocation(member);

            diTypes.push([member.name.getText(), DITypeBuilder.build(propertyType, typeChecker)]);
        }
    });

    const result = chunk(diTypes, 2).map(it => {
        const [first, second] = it;
        const [firstName, firstType] = first;
        const [secondName, secondType] = second;

        return `first: ${firstName}, second: ${secondName}, compatible: ${firstType.isCompatible(secondType)}`;
    });

    console.log(result);
};

//property: {data: string} - 182
//type a = {}; property: {data: string} -

