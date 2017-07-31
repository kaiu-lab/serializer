import { METADATA_CUSTOM_FIELDS } from './field-name';

export const METADATA_SERIALIZE_FIELD_NAME = 'serializer:serialize:field';
/**
 * Tags a property to map from a different field name upon serialization.
 *
 * #TODO Documentation for 1.1.0
 *
 * @decorator Property
 */
export function SerializeFieldName(fieldName: string): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        const customFieldNames = Reflect.getMetadata(METADATA_CUSTOM_FIELDS, target) || [];
        Reflect.defineMetadata(METADATA_CUSTOM_FIELDS, customFieldNames.concat([propertyKey]), target);
        Reflect.defineMetadata(METADATA_SERIALIZE_FIELD_NAME, fieldName, target, propertyKey);
    };
}
