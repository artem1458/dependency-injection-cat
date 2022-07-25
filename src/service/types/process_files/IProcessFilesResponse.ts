import { ICompilationMessage } from '../../../compilation-context/messages/ICompilationMessage';

//TODO add more stats
export interface IProcessFilesResponse {
    compilationMessages: ICompilationMessage[];
    modificationStamps: Record<string, number>;
    coldFilePaths: string[];
}
