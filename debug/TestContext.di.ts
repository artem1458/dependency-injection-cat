import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
}

export interface IRequester {}

class TestContext extends CatContext<ITestContext> {
    @Bean requester0: IRequester = {}
    @Bean requester1: IRequester = {}
    @Bean requester2: IRequester = {}
    @Bean requester3: IRequester = {}
    @Bean requester4: IRequester = {}
    @Bean requester5: IRequester = {}

    @Bean
    xz(
        requesters: IRequester[],
    ): string {
        requesters.forEach(requester => {
            //requester.get();
        });

        return '';
    }
}
