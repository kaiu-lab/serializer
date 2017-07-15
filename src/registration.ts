/**
 * Created by Supamiu on 07/07/17.
 *
 * Registrations allow the serializer to handle inheritance,
 * they have to be defined if you want to be able to handle inheritance.
 */
export declare interface Registration {
    parent: any;
    children: { [index: string]: { new(...args: any[]): any } };
}
