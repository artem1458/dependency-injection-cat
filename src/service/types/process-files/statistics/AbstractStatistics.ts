export abstract class AbstractStatistics {

    abstract type: StatisticsType;
}

export enum StatisticsType {
    BEAN_DEPENDENCIES = 'BEAN_DEPENDENCIES',
    BEAN_DECLARATION_LINK = 'BEAN_DECLARATION_LINK',
}
