export interface IDiConfig {
    diConfigPattern?: string;
    ignorePatterns?: Array<string>;
    errorMessageType: 'debug' | 'human';
    disableLogoPrint?: boolean;
}
