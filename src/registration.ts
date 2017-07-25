import { Instantiable } from './instantiable';

/**
 * Registrations allow the serializer to handle inheritance,
 * they have to be defined if you want to be able to handle inheritance.
 *
 * ## Example:
 * ```typescript
 * let registrations =
 * [
 *      {
 *          parent: Foo,
 *          children:
 *          {
 *              'bar':Bar,
 *              'baz':Baz
 *          }
 *      }
 * ]
 * ```
 */
export interface Registration {
    parent: any;
    children: { [index: string]: Instantiable };
}
