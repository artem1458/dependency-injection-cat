import { IDiConfig } from './IDiConfig';
import { WrongConfigurationException } from '../../exceptions/compilation/WrongConfigurationException';

class DiConfig implements IDiConfig {
    diConfigPattern = '**/*.di.ts';
    ignorePatterns = ['**/node_modules/**'];

    _errorMessageType: 'debug' | 'human' = 'human';

    get errorMessageType(): 'debug' | 'human' {
        return this._errorMessageType;
    }

    set errorMessageType(type: 'debug' | 'human') {
        if (type === 'debug' || type === 'human') {
            this._errorMessageType = type;

            return;
        }

        throw new WrongConfigurationException(`Config option "errorMessageType" should be a "debug" | "human", yours is ${type}`);
    }
}

export const diConfig: IDiConfig = new DiConfig();
