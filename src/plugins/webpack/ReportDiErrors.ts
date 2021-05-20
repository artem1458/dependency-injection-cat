import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationError } from '../../compilation-context/CompilationError';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';

export default class {
    apply(compiler: any) {
        compiler.hooks.afterCompile.tap('Report DI Errors', (compilation: any) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                SourceFilesCache.clearCache();
                return;
            }

            PathResolverCache.clearCache();
            SourceFilesCache.clearCache();
            throw new CompilationError(message);
        });
    }
}
