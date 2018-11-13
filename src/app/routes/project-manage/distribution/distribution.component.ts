import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from '../../../common.service';

@Component({
    providers: [CommonService],
    selector: 'app-distribution',
    templateUrl: './distribution.component.html',
})
export class DistributionComponent implements OnInit {
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
    submoduleSlt: any = []; // 显示子模块下拉数据
    unameSlt: any = []; // 显示责任人下拉数据
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    loading = false; // 控制modal框内提交按钮的loading状态
    nameOption: string; // 项目下拉值
    unameOption: string; // 负责人下拉值
    parent_moduleOption: string; // 父模块下拉值
    versionOption: string; // 版本下拉值
    controlArray: Array<{ id: number, submodule: string, value: any }> = [];
    initUrl = '/project_model_test/module_info';
    constructor(private fb: FormBuilder,
        private modalService: NzModalService,
        private http: _HttpClient, private message: NzMessageService,private commonService: CommonService,
    ) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: [null, [Validators.required]],
            parent_module: [null, [Validators.required]],
            description: [null, []],
            pre_time: [null, [Validators.required]],
            submodule: [null, [Validators.required]],
            uname: [null, [Validators.required]],
            id: [null, []]
        });
        this.getList(); // 调用获取列表数据的方法
    }

    /* 获取数据的方法 */
    getList(): void {
        this.http.get('/project_model_test/distribution_module').subscribe(res => {
            this.tbltotal = res['msg'].length;
            this.tableData = res['msg'];
            this.copyData = res['msg'];
        });
        this.http.get('/user_manager/user_register').subscribe(res => {
            const sltArr = [];
            res['msg'].forEach(element => {
                if (element.map_name === '普通管理员' || element.map_name === '项目管理员') {
                    sltArr.push({ label: element['rname'], value: element['uname'] });
                }
            });
            this.unameSlt = sltArr;
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
        this.http.get(`${this.initUrl}?parent_sub=2`).subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                const pt = Array.isArray(res['msg'][index].submodule) ? res['msg'][index].submodule : [res['msg'][index].submodule];
                for (let i = 0; i < pt.length; i++) {
                    arr.push({ label: pt[i], value: pt[i] });
                }
            }
            this.submoduleSlt = arr;
        });
    }
    unameSrc(input, oldData) {
        if (oldData.nzValue.indexOf(input) >= 0 || oldData.nzLabel.indexOf(input) >= 0) {
            return true;
        }
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
            if (flag && !type) {
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

    /* 父模块下拉改变时触发 */
    getSModule(flag) {
        if (!flag) {
            this.http.get(`${this.initUrl}?parent_sub=2`).subscribe(res => {
                const arr = [];
                for (let index = 0; index < res['msg'].length; index++) {
                    if ((res['msg'][index].name === this.nameOption) && (res['msg'][index].version === this.versionOption) && (res['msg'][index].parent_module === this.parent_moduleOption)) {
                        const pt = Array.isArray(res['msg'][index].submodule) ? res['msg'][index].submodule : [res['msg'][index].submodule];
                        for (let i = 0; i < pt.length; i++) {
                            arr.push({ label: pt[i], value: pt[i] });
                        }
                    }
                }
                if (flag) {
                    this.formGroup.value.submodule = null;
                    this.formGroup.reset(this.formGroup.value);
                }
                this.submoduleSlt = arr;
            });
        }
    }

    /* 添加之前执行的方法 */
    befAdd() {
        this.submoduleSlt = [];
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.add');
        // 重置表单
        this.formGroup.reset();
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'post';
        this.parent_moduleSlt = [];
        this.versionSlt = [];
        // 使表单可修改
        this.isFormDisabled = false;
        // 弹出modialog
        this.modalVisible = true;
    }

    /*修改前执行的方法 */
    befEdit(rowData) {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.modify');
        this.getVersion(0, 0);
        this.getPModule(0);
        this.getSModule(0);
        this.formGroup.reset(rowData);
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'put';
        // 显示弹出框
        this.modalVisible = true;
        // 使表单不可修改
        this.isFormDisabled = true;
    }

    /* 查询 */
    doSearch() {
        this.searchloading = true;
        if (this.q['operate_time']) {
            this.q['startdate'] = moment(this.q.operate_time[0]).format('YYYY-MM-DD HH:mm:ss');
            this.q['enddate'] = moment(this.q.operate_time[1]).format('YYYY-MM-DD HH:mm:ss');
        }
        if (this.q.pre_time) {
            this.q['pre_startdate'] = moment(this.q.pre_time[0]).format('YYYY-MM-DD HH:mm:ss');
            this.q['pre_enddate'] = moment(this.q.pre_time[1]).format('YYYY-MM-DD HH:mm:ss');
        }
        this.http.get('/project_model_test/distribution_module', this.q)
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
            self.formGroup.value['pre_time'] = moment(self.formGroup.value['pre_time']).format('YYYY-MM-DD HH:mm:ss');
            self.formGroup.value['submodule'] = Array.isArray(self.formGroup.value['submodule']) ? self.formGroup.value['submodule'].join(',') : self.formGroup.value['submodule'];
            self.formGroup.value['rname'] = self.unameSlt.filter(data => data.value === self.formGroup.value['uname'])[0].label;

            for (let i = 0; i < self.tableData.length; i++) {
                if (self.tableData[i].id === self.formGroup.value['id']) {
                    self.formGroup.value['old_submodule'] = Array.isArray(self.tableData[i].submodule) ? self.tableData[i].submodule.join(',') : self.tableData[i].submodule;
                }
            }
            if (self.ajaxType === 'put') {
                self.http.put('/project_model_test/distribution_module', self.formGroup.value)
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
                const disData = self.tableData.filter(data => data.name === self.formGroup.value['name'] && data.version === self.formGroup.value['version'] && data.parent_module === self.formGroup.value['parent_module'] && data.uname === self.formGroup.value['uname']);
                const copyArr = [], sub = Array.isArray(self.formGroup.value['submodule']) ? self.formGroup.value['submodule'] : [self.formGroup.value['submodule']];
                for (let i = 0; i < disData.length; i++) {
                    if (sub.indexOf(disData[i].submodule) >= 0) {
                        copyArr.push(disData[i].submodule);
                    }
                }
                if (copyArr.length) {
                    self.loading = false;
                    self.message.error(self.commonService.fanyi('project-manage.module.has-been-to')+ self.formGroup.value['rname'] + self.commonService.fanyi('project-manage.module.distribution')+'“' + copyArr.join(',') + '”'+self.commonService.fanyi('common.the-child-module'));
                    return;
                }
                self.http.post('/project_model_test/distribution_module', self.formGroup.value)
                    .subscribe(
                        (data) => {
                            self.tableData = data['msg'];
                            self.loading = false;
                            self.modalService.confirm({
                                nzContent: self.commonService.fanyi('project-manage.module.whether-to-continue-to-allocate'),
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
    del(id: number) {
        this.http.delete('/project_model_test/distribution_module', { id: id })
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
