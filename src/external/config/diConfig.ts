import { IDiConfig } from './IDiConfig';

class DiConfig implements IDiConfig {
    diConfigPattern = '**/*.di.ts';
    ignorePatterns = ['**/node_modules/**'];
}

export const diConfig: IDiConfig = new DiConfig();
