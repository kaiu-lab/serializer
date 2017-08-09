import 'reflect-metadata';
import { Class } from '../class';

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
export function DeserializeAs(clazz: Class | [Class]): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata(METADATA_DESERIALIZE_AS, clazz, target, propertyKey);
    };
}
