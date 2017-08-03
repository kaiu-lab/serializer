import 'reflect-metadata';
import { Instantiable } from '../instantiable';

export const METADATA_DESERIALIZE_AS = 'serializer:class';
/**
 * Tags a property to be deserialized as a given class.
 *
 * ## Example:
 * ```typescript
 * export class Foo{
 *      @DeserializeAs(Bar)
 *      bar:Bar;
 * }
 * ```
 *
 * @decorator Property
 */
export function DeserializeAs(clazz: Instantiable): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata(METADATA_DESERIALIZE_AS, clazz, target, propertyKey);
    };
}
