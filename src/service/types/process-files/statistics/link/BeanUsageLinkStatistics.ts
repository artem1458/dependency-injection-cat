import { AbstractStatistics, StatisticsType } from '../AbstractStatistics';
import { IBeanDescriptor } from '../../../../../core/bean/BeanRepository';
import { getPositionOfNode } from '../../../../../core/utils/getPositionOfNode';
import upath from 'upath';
import { ILinkPositionDescriptor, ILinkStatistics, LinkType } from './ILinkStatistics';
import { IBeanDependencyDescriptor } from '../../../../../core/bean-dependencies/BeanDependenciesRepository';
import { isNamedClassDeclaration } from '../../../../../core/ts-helpers/predicates/isNamedClassDeclaration';
import ts from 'typescript';

export class BeanUsageLinkStatistics extends AbstractStatistics implements ILinkStatistics {

    static build(beanDescriptor: IBeanDescriptor, dependencyDescriptors: IBeanDependencyDescriptor[]): BeanUsageLinkStatistics[] {
        const result: BeanUsageLinkStatistics[] = [];

        const fromPosition: ILinkPositionDescriptor = {
            path: beanDescriptor.contextDescriptor.absolutePath,
            nodePosition: getPositionOfNode(beanDescriptor.node.name),
        };

        dependencyDescriptors.forEach(dependencyDescriptor => {
            const toPosition: ILinkPositionDescriptor = {
                path: upath.normalize(dependencyDescriptor.node.getSourceFile().fileName),
                nodePosition: getPositionOfNode(dependencyDescriptor.node.name)
            };

            let parentName: string | null = null;

            const firstParent: ts.Node | null = dependencyDescriptor.node?.parent?.parent ?? null;
            const secondParent: ts.Node | null = dependencyDescriptor.node?.parent?.parent?.parent ?? null;

            if (isNamedClassDeclaration(firstParent)) {
                parentName = firstParent.name.getText();
            } else if (isNamedClassDeclaration(secondParent)) {
                parentName = secondParent.name.getText();
            }

            const presentableName = parentName === null
                ? `::${beanDescriptor.classMemberName}`
                : `${parentName}::${beanDescriptor.classMemberName}`;

            result.push(new BeanUsageLinkStatistics(toPosition, fromPosition, presentableName));
        });

        if (beanDescriptor.publicInfo !== null) {
            const toPosition: ILinkPositionDescriptor = {
                path: upath.normalize(beanDescriptor.publicInfo.publicNode.getSourceFile().fileName),
                nodePosition: getPositionOfNode(beanDescriptor.publicInfo.publicNode.name),
            };

            let parentName: string | null = null;

            if (ts.isInterfaceDeclaration(beanDescriptor.publicInfo.publicNode.parent)) {
                parentName = beanDescriptor.publicInfo.publicNode.parent.name.getText();
            }

            const presentableName = parentName === null
                ? `::${beanDescriptor.classMemberName}`
                : `${parentName}::${beanDescriptor.classMemberName}`;

            result.push(new BeanUsageLinkStatistics(toPosition, fromPosition, presentableName));
        }

        return result;
    }

    public type = StatisticsType.LINK;
    public linkType = LinkType.BEAN_USAGE_DECLARATION;
    public fromPosition: ILinkPositionDescriptor;
    public toPosition: ILinkPositionDescriptor;
    public presentableName: string;

    private constructor(
        toPosition: ILinkPositionDescriptor,
        fromPosition: ILinkPositionDescriptor,
        presentableName: string
    ) {
        super();

        this.toPosition = toPosition;
        this.fromPosition = fromPosition;
        this.presentableName = presentableName;
    }

    // private constructor(
    //     dependencyDescriptor: IBeanDependencyDescriptor,
    //     linkPosition: ILinkPositionDescriptor,
    // ) {
    //     super();
    //
    //     this.toPosition = {
    //         path: upath.normalize(dependencyDescriptor.node.getSourceFile().fileName),
    //         nodePosition: getPositionOfNode(dependencyDescriptor.node.name)
    //     };
    //
    //     const topLevelParent = dependencyDescriptor.node.parent?.parent ?? null;
    //
    //     let parentName: string | null = null;
    //
    //     if (topLevelParent !== null && isNamedClassDeclaration(topLevelParent)) {
    //         parentName = topLevelParent.name.getText();
    //     }
    //
    //     if (parentName === null) {
    //         this.presentableName = dependencyDescriptor.parameterName;
    //     } else {
    //         this.presentableName = `${parentName}::${dependencyDescriptor.parameterName}`;
    //     }
    //
    //     this.fromPosition = linkPosition;
    // }
}
