import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ModulesRoutingModule } from './modules-routing.module';
import { ParentModulesComponent } from './parent-modules/parent-modules.component';
import { SubModulesComponent } from './submodules/submodules.component';

const COMPONENT_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    ModulesRoutingModule
  ],
  declarations: [
    ...COMPONENT_NOROUNT,
    ParentModulesComponent,
    SubModulesComponent
  ],
  entryComponents: COMPONENT_NOROUNT
})
export class ModulesModule { }
