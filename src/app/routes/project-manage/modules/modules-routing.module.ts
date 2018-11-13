import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentModulesComponent } from './parent-modules/parent-modules.component';
import { SubModulesComponent } from './submodules/submodules.component';

const routes: Routes = [
  { path: 'parent-modules', component: ParentModulesComponent },
  { path: 'submodules', component: SubModulesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
