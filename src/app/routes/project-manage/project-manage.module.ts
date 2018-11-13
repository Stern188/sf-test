import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ProjectManageRoutingModule } from './project-manage-routing.module';
import { ProjectsComponent } from './projects/projects.component';
import { VersionsComponent } from './versions/versions.component';
import { DistributionComponent } from './distribution/distribution.component';

const COMPONENT_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    ProjectManageRoutingModule
  ],
  declarations: [
    ...COMPONENT_NOROUNT,
    ProjectsComponent,
    VersionsComponent,
    DistributionComponent
  ],
  entryComponents: COMPONENT_NOROUNT
})
export class ProjectManageModule { }
