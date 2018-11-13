import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UserManageRoutingModule } from './user-manage-routing.module';
import { MembersComponent } from './members/members.component';

const COMPONENT_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    UserManageRoutingModule
  ],
  declarations: [
    ...COMPONENT_NOROUNT,
    MembersComponent
  ],
  entryComponents: COMPONENT_NOROUNT
})
export class UserManageModule { }
