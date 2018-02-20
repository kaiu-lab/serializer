import 'reflect-metadata';

/**
 * @hidden
 */
export const METADATA_SERIALIZE_FIELD_NAME = 'serializer:serialize:field';
/**
 * Tags a property to map from a different field name upon serialization.
 *
 * ## Example:
 *
 * ```typescript
 * export class Example{
 *      @SerializeFieldName('bar')
 *      foo: string;
 * }
 *
 * const obj = new Example();
 * obj.foo = 'baz'
 * const result = serializer.serialize(obj);
 * console.log(obj);
 * ```
 *
 * This will print the object as if `foo` property was named `bar`.
 *
 * @decorator Property
 */
export function SerializeFieldName(fieldName: string): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        Reflect.defineMetadata(METADATA_SERIALIZE_FIELD_NAME, fieldName, target, propertyKey);
    };
}
