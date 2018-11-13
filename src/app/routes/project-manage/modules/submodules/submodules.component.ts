import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from '../../../../common.service';

@Component({
    providers: [CommonService],
    selector: 'app-submodules',
    templateUrl: './submodules.component.html',
})
export class SubModulesComponent implements OnInit {
    q: any = { flag: 1 }; // 查询表单
    expandForm = false; // 控制查询表单的显示隐藏
    searchloading = false; // 控制查询按钮的loading状态
    formGroup: FormGroup;
    tbltotal: number; // 表格总条数
    addOrUpldTitle: string;// 定义modialog头部title变量
    ajaxType: string; // 定义ajax标识ajaxType=post(添加)；ajaxType=put(修改)
    isFormDisabled: boolean; // 定义表单是否可填
    modalVisible = false; // 控制modal的显示与否
    tableData: any = []; // 表格实际显示的数据
    projectnameSlt: any = []; // 显示项目下拉数据
    versionSlt: any = []; // 显示版本下拉数据
    versionSlt1: any = []; // 显示版本下拉数据
    parent_moduleSlt: any = []; // 显示父模块下拉数据
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    loading = false; // 控制modal框内提交按钮的loading状态
    nameOption: string; // 项目下拉值
    versionOption: string; // 版本下拉值
    controlArray: Array<{ id: number, submodule: string, value: any }> = [];
    initUrl = '/project_model_test/module_info';
    constructor(private fb: FormBuilder,
        private modalService: NzModalService,
        private http: _HttpClient, private message: NzMessageService, private commonService: CommonService,
    ) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: [null, [Validators.required]],
            parent_module: [null, [Validators.required]],
            description: [null, []],
            id: [null, []]
        });
        this.getList(); // 调用获取列表数据的方法
    }

    /* 获取数据的方法 */
    getList(): void {
        this.http.get(`${this.initUrl}?parent_sub=2`).subscribe(res => {
            this.tbltotal = res['msg'].length;
            this.tableData = res['msg'];
            this.copyData = res['msg'];
        });
        this.http.get('/project-manage/projects').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                arr.push({ label: res['msg'][index].name, value: res['msg'][index].name });
            }
            this.projectnameSlt = arr;
        });
        this.http.get('/project-manage/versions').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                arr.push({ label: res['msg'][index].version, value: res['msg'][index].version });
            }
            this.versionSlt = arr;
        });
        this.http.get(`${this.initUrl}?parent_sub=1`).subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                const pt = Array.isArray(res['msg'][index].parent_module) ? res['msg'][index].parent_module : [res['msg'][index].parent_module];
                for (let i = 0; i < pt.length; i++) {
                    arr.push({ label: pt[i], value: pt[i] });
                }
            }
            this.parent_moduleSlt = arr;
        });
    }
    addField(type, e?: MouseEvent): void {
        if (e) {
            e.preventDefault();
        }
        const id = (this.controlArray.length > 0) ? this.controlArray[this.controlArray.length - 1].id + 1 : 0;
        if (type) {
            const control = {
                id,
                submodule: `passenger${id}`,
                value: ''
            };
            const index = this.controlArray.push(control);
            this.formGroup.addControl(this.controlArray[index - 1].submodule, new FormControl(null, Validators.required));
        }
    }

    removeField(i: { id: number, submodule: string, value: any }, e: MouseEvent): void {
        e.preventDefault();
        if (this.controlArray.length > 1) {
            const index = this.controlArray.indexOf(i);
            this.controlArray.splice(index, 1);
            console.log(this.controlArray);
            this.formGroup.removeControl(i.submodule);
        }
    }
    getFormControl(name: string): AbstractControl {
        return this.formGroup.controls[name];
    }

    /* 项目下拉改变时触发 */
    getVersion(flag, type) {
        this.http.get('/project-manage/versions').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                if (type) {
                    if (!flag) {
                        this.q.version = null;
                        break;
                    }
                    if (res['msg'][index].name === flag) {
                        arr.push({ label: res['msg'][index].version, value: res['msg'][index].version });
                    }

                } else {
                    if (res['msg'][index].name === this.nameOption) {
                        arr.push({ label: res['msg'][index].version, value: res['msg'][index].version });
                    }
                }
            }
            if (!type) {
                this.formGroup.value.version = null;
                this.formGroup.reset(this.formGroup.value);
                this.versionSlt = arr;
            } else {
                this.versionSlt1 = arr;
            }
        });
    }

    /* 版本号下拉改变时触发 */
    getPModule(flag) {
        if (!flag) {
            this.http.get(`${this.initUrl}?parent_sub=1`).subscribe(res => {
                const arr = [];
                for (let index = 0; index < res['msg'].length; index++) {
                    if ((res['msg'][index].name === this.nameOption) && (res['msg'][index].version === this.versionOption)) {
                        const pt = Array.isArray(res['msg'][index].parent_module) ? res['msg'][index].parent_module : [res['msg'][index].parent_module];
                        for (let i = 0; i < pt.length; i++) {
                            arr.push({ label: pt[i], value: pt[i] });
                        }
                    }
                }
                if (flag) {
                    this.formGroup.value.parent_module = null;
                    this.formGroup.reset(this.formGroup.value);
                }
                this.parent_moduleSlt = arr;
            });
        }
    }

    /* 添加之前执行的方法 */
    befAdd() {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.add');
        // 重置表单
        this.formGroup.reset();
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'post';
        // 使表单可修改
        this.isFormDisabled = false;
        this.parent_moduleSlt = [];
        this.versionSlt = [];
        // 弹出modialog
        this.modalVisible = true;
        this.controlArray = [];
        for (const key in this.formGroup.controls) {
            if (key.indexOf('passenger') >= 0) {
                this.formGroup.removeControl(key);
            }
        }
        this.addField(1);
    }

    /*修改前执行的方法 */
    befEdit(rowData) {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.modify');
        this.getPModule(0);
        this.formGroup.reset(rowData);
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'put';
        // 显示弹出框
        this.modalVisible = true;
        // 使表单不可修改
        this.isFormDisabled = true;
        this.controlArray = [];
        const p = typeof (rowData.submodule) === 'string' ? rowData.submodule.split(',') : rowData.submodule;
        for (let i = 0; i < p.length; i++) {
            this.controlArray.push({ id: i, submodule: `passenger${i}`, value: p[i] });
            this.formGroup.addControl(`passenger${i}`, new FormControl(p[i], Validators.required));
        }
        this.addField(0);
    }

    /* 查询 */
    doSearch() {
        this.searchloading = true;
        if (this.q['operate_time']) {
            this.q['startdate'] = moment(this.q.operate_time[0]).format('YYYY-MM-DD HH:mm:ss');
            this.q['enddate'] = moment(this.q.operate_time[1]).format('YYYY-MM-DD HH:mm:ss');
        }
        this.q['parent_sub'] = 2;
        this.http.get(this.initUrl, this.q)
            .subscribe(
                (data) => {
                    this.tbltotal = data['msg'].length;
                    this.tableData = data['msg'];
                    this.searchloading = false;
                    this.message.success(this.commonService.fanyi('tip.query-success'));
                },
                err => {
                    this.searchloading = false;
                    this.message.success(this.commonService.fanyi('tip.query-fail'));
                }
            );
    }

    /* 保存和修改 */
    addOrUpl() {
        const self = this;
        for (const i in self.formGroup.controls) {
            self.formGroup.controls[i].markAsDirty();
            self.formGroup.controls[i].updateValueAndValidity();
        }
        if (self.formGroup.valid) {
            self.loading = true;
            const val = self.formGroup.value, parr = [];
            for (const key in val) {
                if (key.indexOf('passenger') >= 0) {
                    if (parr.indexOf(val[key]) >= 0) {
                        self.message.error(self.commonService.fanyi('project-manage.module.added-submodule-with-renaming') + val[key]);
                        self.loading = false;
                        return;
                    } else {
                        parr.push(val[key]);
                    }
                }
            }

            for (let i = 0; i < self.tableData.length; i++) {
                if (self.tableData[i].id !== self.formGroup.value['id'] && self.tableData[i].parent_module === self.formGroup.value['parent_module'] && self.tableData[i].name === self.formGroup.value['name']) {
                    for (let j = 0; j < parr.length; j++) {
                        const subData = Array.isArray(self.tableData[i].submodule) ? self.tableData[i].submodule : [self.tableData[i].submodule];
                        if (subData.indexOf(parr[j]) >= 0) {
                            self.message.error(self.commonService.fanyi('project-manage.module.added-submodule-with-renaming') + parr[j]);
                            self.loading = false;
                            return;
                        }
                    }
                }
                if (self.tableData[i].id === self.formGroup.value['id']) {
                    self.formGroup.value['old_submodule'] = Array.isArray(self.tableData[i].submodule) ? self.tableData[i].submodule.join(',') : self.tableData[i].submodule;
                }
            }
            self.formGroup.value['submodule'] = parr.join(',');
            self.formGroup.value['parent_sub'] = 2;
            if (self.ajaxType === 'put') {
                self.http.put(self.initUrl, self.formGroup.value)
                    .subscribe(
                        (data) => {
                            self.tableData = data.msg;
                            self.loading = false;
                            self.modalVisible = false;
                            self.message.success(self.commonService.fanyi('tip.update-success'));
                        },
                        err => {
                            self.loading = false;
                            self.modalVisible = false;
                            self.message.success(self.commonService.fanyi('tip.update-fail'));
                        }
                    );
            } else {
                const hasPmodule = self.tableData.filter(data => data.name === self.formGroup.value['name'] && data.version === self.formGroup.value['version'] && data.parent_module === self.formGroup.value['parent_module']).length;
                if (hasPmodule) {
                    self.loading = false;
                    self.message.warning(self.commonService.fanyi('project-manage.module.child-module-has-been-added-if-change-edit-parent-module'));
                    return;
                }
                self.http.post(self.initUrl, self.formGroup.value)
                    .subscribe(
                        (data) => {
                            self.tableData = data['msg'];
                            self.loading = false;
                            self.modalService.confirm({
                                nzTitle: self.commonService.fanyi('project-manage.module.confirmation-box'),
                                nzContent: self.commonService.fanyi('project-manage.module.whether-to-continue-to-add'),
                                nzOnOk: function () {
                                    self.formGroup.reset({ name: self.formGroup.value['name'], version: self.formGroup.value['version'] });
                                },
                                nzOnCancel: function () {
                                    self.modalVisible = false;
                                    self.message.success(self.commonService.fanyi('tip.submitted-success'));
                                },
                            });
                        },
                        err => {
                            self.loading = false;
                            self.modalVisible = false;
                            self.message.success(self.commonService.fanyi('tip.submitted-fail'));
                        }
                    );
            }
        }
    }

    /* 删除 */
    del(datas) {
        datas['parent_sub'] = 2;
        this.http.delete(this.initUrl, datas)
            .subscribe(
                (data) => {
                    this.tableData = data.msg;
                    this.message.success(this.commonService.fanyi('tip.delete-success'));
                },
                err => this.message.error(this.commonService.fanyi('tip.delete-fail'))
            );
    }

    /*以下为表格搜索和排序功能 */
    sortName = null;
    sortValue = null;
    sort(sortName, value) {
        this.sortName = sortName;
        this.sortValue = value;
        this.tableData = [...this.tableData.sort((a, b) => {
            if (a[this.sortName] > b[this.sortName]) {
                return (this.sortValue === 'ascend') ? 1 : -1;
            } else if (a[this.sortName] < b[this.sortName]) {
                return (this.sortValue === 'ascend') ? -1 : 1;
            } else {
                return 0;
            }
        })];
    }
    doReset() {
        this.q = { flag: 1 };
    }
}
