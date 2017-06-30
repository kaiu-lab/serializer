/**
 * Created by Supamiu on 30/06/17.
 */
export interface ParentOptions {
    children: {[index: string]: new() => any},
    discriminantField: string
}