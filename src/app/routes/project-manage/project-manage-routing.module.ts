import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { VersionsComponent } from './versions/versions.component';
import { DistributionComponent } from './distribution/distribution.component';

const routes: Routes = [
  { path: 'projects', component: ProjectsComponent },
  { path: 'versions', component: VersionsComponent },
  { path: 'modules', loadChildren: './modules/modules.module#ModulesModule' },
  { path: 'distribution', component: DistributionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectManageRoutingModule { }
