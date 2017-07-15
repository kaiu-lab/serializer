import 'reflect-metadata';
/**
 * Created by Supamiu on 29/06/17.
 *
 * Tags a property to be deserialized as a given class, alowing the serializer to handle typed properties too.
 */
export function DeserializeAs(clazz: {new(...args: any[]): any}): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata('serialize:class', clazz, target, propertyKey);
    };
}
