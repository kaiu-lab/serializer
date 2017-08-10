import { METADATA_DESERIALIZE_FIELD_NAME } from './deserialize-field-name';

/**
 * @hidden
 */
export const METADATA_CUSTOM_FIELDS = 'serializer:field:properties';
/**
 * Tags a property to map from a different field name.
 *
 * ## Example:
 *
 * ```typescript
 * export class Example{
 *      @FieldName('bar')
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
export function FieldName(fieldName: string): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        const customFieldNames = Reflect.getMetadata(METADATA_CUSTOM_FIELDS, target) || [];
        Reflect.defineMetadata(METADATA_CUSTOM_FIELDS, [ ...customFieldNames, propertyKey], target);
        Reflect.defineMetadata(METADATA_DESERIALIZE_FIELD_NAME, fieldName, target, propertyKey);
    };
}
