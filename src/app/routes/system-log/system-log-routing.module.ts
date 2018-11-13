import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelfTestRecordsComponent } from './self-test-records/self-test-records.component';
import { OperationLogComponent } from './operation-log/operation-log.component';

const routes: Routes = [
  { path: 'self-test-records', component: SelfTestRecordsComponent },
  { path: 'operation-log', component: OperationLogComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemLogRoutingModule { }
