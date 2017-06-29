import { NgModule, ModuleWithProviders } from '@angular/core';
import { Serializer } from './serializer';

@NgModule({
    providers: [Serializer]
})
export class NgSerializerModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgSerializerModule
        };
    }

}