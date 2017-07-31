import { METADATA_CUSTOM_FIELDS } from './field-name';

export const METADATA_DESERIALIZE_FIELD_NAME = 'serializer:deserialize:field';
/**
 * Tags a property to map from a different field name upon deserialization.
 *
 * ## Example:
 *
 * ```typescript
 * export class Example{
 *      @DeserializeFieldName('bar')
 *      foo: string;
 * }
 *
 * const result = serializer.deserialize<Example>({ bar: 'hey' }, Example);
 * console.log(result.foo);
 * ```
 *
 * This will print `hey` because the attribute with name `bar` has been mapped into the `foo` property.
 *
 * @decorator Property
 */
export function DeserializeFieldName(fieldName: string): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        const customFieldNames = Reflect.getMetadata(METADATA_CUSTOM_FIELDS, target) || [];
        Reflect.defineMetadata(METADATA_CUSTOM_FIELDS, customFieldNames.concat([propertyKey]), target);
        Reflect.defineMetadata(METADATA_DESERIALIZE_FIELD_NAME, fieldName, target, propertyKey);
    };
}
