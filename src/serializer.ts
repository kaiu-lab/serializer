import 'reflect-metadata';
import { Injectable } from '@angular/core';

/**
 * A simple service to inject where you need to be able to use serialization with more than JSON would do.
 */
@Injectable()
export class Serializer {

    public deserialize<T>(obj: any, clazz?: {new(): any}): T {
        //if the class parameter is not specified, we can directly return the basic object.
        if (!clazz) {
            return obj;
        }
        //First of all, we'll create an instance of our class
        let result: T = new clazz();
        //Then we copy every property of our object to our clazz
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                let metadata: new() => any = Reflect.getMetadata('serialize:class', result, prop);
                if (metadata !== undefined) {
                    if (obj[prop] instanceof Array) {
                        result[prop] = [];
                        for (let item of obj[prop]) {
                            result[prop].push(this.deserialize(item, metadata));
                        }
                    } else {
                        result[prop] = this.deserialize(obj[prop], metadata);
                    }
                } else {
                    result[prop] = obj[prop];
                }
            }
        }
        return result;
    }
}