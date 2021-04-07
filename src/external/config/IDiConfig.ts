export interface IDiConfig {
    diConfigPattern?: string;
    compiledContextOutputDir?: string;
    ignorePatterns?: Array<string>;
    errorMessageType: 'debug' | 'human';
    disableLogoPrint?: boolean;
}
