type TPostConstruct = PropertyDecorator & MethodDecorator;

export const PostConstruct: TPostConstruct = () => {
    throw new Error('Trying to use @PostConstruct without configured di-container, or not in context-class');
};
