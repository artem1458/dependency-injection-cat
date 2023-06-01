export const PostConstruct: PropertyDecorator & MethodDecorator = () => {
    throw new Error('Trying to use @PostConstruct without configured di-container, or not in context-class');
};
