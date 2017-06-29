import { Injectable } from '@angular/core';

/**
 * A simple service to inject where you need to be able to use serialization with more than JSON would do.
 */
@Injectable()
export class Serializer {

    public serialize(obj: any): string {
        //TODO add support for custom fields, but priority goes to deserialization
        return JSON.stringify(obj);
    }

    public deserialize(json: string): any {
        //TODO add support for an advanced management, else, the library is useless.
        return JSON.parse(json);
    }
}