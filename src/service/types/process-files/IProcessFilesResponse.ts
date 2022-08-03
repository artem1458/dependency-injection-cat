import { ICompilationMessage } from '../../../compilation-context/messages/ICompilationMessage';
import { StatisticsType } from './statistics/AbstractStatistics';

//TODO add more stats
export interface IProcessFilesResponse {
    compilationMessages: ICompilationMessage[];
    modificationStamps: Record<string, number>;
    statistics: IProcessFilesStatistics[];
}

export interface IProcessFilesStatistics {
    type: StatisticsType;
    payload: string;
}
