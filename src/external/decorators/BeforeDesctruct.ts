export const BeforeDestruct: PropertyDecorator & MethodDecorator = () => {
    throw new Error('Trying to use @BeforeDestruct without configured di-container, or not in context-class');
};
