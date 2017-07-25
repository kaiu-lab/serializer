/**
 * Type for instantiable classname.
 */
export type Instantiable<T = any> = {new(...args: any[]): T};
