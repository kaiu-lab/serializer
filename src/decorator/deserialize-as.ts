import 'reflect-metadata';
/**
 * Created by Supamiu on 29/06/17.
 */
export function DeserializeAs(clazz: {new(): any}): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata('serialize:class', clazz, target, propertyKey);
    };
}