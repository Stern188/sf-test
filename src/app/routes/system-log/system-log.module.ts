import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SystemLogRoutingModule } from './system-log-routing.module';
import { SelfTestRecordsComponent } from './self-test-records/self-test-records.component';
import { OperationLogComponent } from './operation-log/operation-log.component';

const COMPONENT_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    SystemLogRoutingModule
  ],
  declarations: [
    ...COMPONENT_NOROUNT,
    SelfTestRecordsComponent,
    OperationLogComponent
  ],
  entryComponents: COMPONENT_NOROUNT
})
export class SystemLogModule { }
