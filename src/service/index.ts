import { ProgramOptionsProvider } from '../program-options/ProgramOptionsProvider';
import { container } from 'dependency-injection-cat';
import { IDICatServiceContext } from './DICatServiceContext.di';

(async () => {
    const appContext = container.getOrInitContext<IDICatServiceContext>({
        name: 'DICatServiceContext',
    }).getBeans();

    ProgramOptionsProvider.init();

    await appContext.service.run();
})();
