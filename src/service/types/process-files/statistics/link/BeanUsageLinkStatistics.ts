import { AbstractStatistics, StatisticsType } from '../AbstractStatistics';
import { IBeanDescriptor } from '../../../../../core/bean/BeanRepository';
import { getPositionOfNode } from '../../../../../core/utils/getPositionOfNode';
import upath from 'upath';
import { ILinkPositionDescriptor, ILinkStatistics, LinkType } from './ILinkStatistics';
import { IBeanDependencyDescriptor } from '../../../../../core/bean-dependencies/BeanDependenciesRepository';
import { isNamedClassDeclaration } from '../../../../../core/ts-helpers/predicates/isNamedClassDeclaration';

export class BeanUsageLinkStatistics extends AbstractStatistics implements ILinkStatistics {

    static build(beanDescriptor: IBeanDescriptor, dependencyDescriptors: IBeanDependencyDescriptor[]): BeanUsageLinkStatistics[] {
        const result: BeanUsageLinkStatistics[] = [];

        const linkPosition: ILinkPositionDescriptor = {
            path: beanDescriptor.contextDescriptor.absolutePath,
            nodePosition: getPositionOfNode(beanDescriptor.node.name),
        };

        dependencyDescriptors.forEach(dependencyDescriptor => {
            result.push(new BeanUsageLinkStatistics(dependencyDescriptor, linkPosition));
        });

        return result;
    }

    public type = StatisticsType.LINK;
    public linkType = LinkType.BEAN_USAGE_DECLARATION;
    public fromPosition: ILinkPositionDescriptor;
    public toPosition: ILinkPositionDescriptor;
    public presentableName: string;

    private constructor(
        dependencyDescriptor: IBeanDependencyDescriptor,
        linkPosition: ILinkPositionDescriptor,
    ) {
        super();

        this.toPosition = {
            path: upath.normalize(dependencyDescriptor.node.getSourceFile().fileName),
            nodePosition: getPositionOfNode(dependencyDescriptor.node.name)
        };

        const topLevelParent = dependencyDescriptor.node.parent?.parent ?? null;

        let parentName: string | null = null;

        if (topLevelParent !== null && isNamedClassDeclaration(topLevelParent)) {
            parentName = topLevelParent.name.getText();
        }

        if (parentName === null) {
            this.presentableName = dependencyDescriptor.parameterName;
        } else {
            this.presentableName = `${parentName}::${dependencyDescriptor.parameterName}`;
        }

        this.fromPosition = linkPosition;
    }
}
