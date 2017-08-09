/**
 * Custom type for class parameters.
 *
 * See https://github.com/Microsoft/TypeScript/issues/17572#issuecomment-319994873.
 */
export type Abstract<T = any> = Function & { prototype: T };
export type Instantiable<T = any> = new (...args: any[]) => T;
export type Class<T = any> = Abstract<T> | Instantiable<T>;
