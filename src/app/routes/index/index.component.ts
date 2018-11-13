import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { XlsxService } from '@delon/abc';
import * as moment from 'moment';
import { SFSchema, SFComponent } from '@delon/form';
import { Router } from '@angular/router';



@Component({
    selector: 'app-index',
    templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
    localUname: string;
    q: any = { flag: 1 }; // 查询表单
    formGroup: FormGroup;
    mformGroup: FormGroup;
    formGroupAssess: FormGroup;
    tbltotal: number; // 表格总条数
    tbltotal3: number; // 表格总条数
    tbltotal1: number; // 表格总条数
    addOrUpldTitle: string; // 定义modialog头部title变量
    modalVisible = false; // 控制自测记录modal的显示与否
    modalVisible1 = false; // 控制自测记录modal的显示与否
    modalAssess = false; // 控制评估的modal
    unameSlt: any = []; // 显示责任人下拉数据
    projectSlt: any = []; // 显示项目下拉数据
    expandForm = false; // 控制查询表单的显示隐藏
    isFormDisabled: boolean; // 定义表单是否可填
    isUnameDisabled: boolean; // 定义负责人是否可填
    isBtnDisabled: boolean; // 定义按钮是否可点
    projectnameSlt: any = []; // 显示项目下拉数据
    versionSlt: any = []; // 显示版本下拉数据
    versionSlt1: any = []; // 显示版本下拉数据
    parent_moduleSlt: any = []; // 显示父模块下拉数据
    submoduleSlt: any = []; // 显示子模块下拉数据
    nameOption: string; // 项目下拉值
    unameOption: string; // 负责人下拉值
    statusOption: string; // 状态下拉值
    versionOption: string; // 版本下拉值
    parent_moduleOption: string; // 父模块下拉值
    uname: string = localStorage.getItem('uname'); // 获取当前登录用户
    ajaxType: string; // 定义ajax标识ajaxType=post(添加)；ajaxType=put(修改)
    initUrl = '/project_model_test/module_info';
    statusSlt: any = [
        {
            value: '1',
            label: '通过'
        }, {
            value: '2',
            label: '部分通过'
        }, {
            value: '3',
            label: '不通过'
        }
    ]; // 显示状态下拉数据
    tableData1: any = []; // 表格实际显示的数据
    tableData: any = []; // 表格实际显示的数据
    tableData3: any = []; // 表格实际显示的数据
    distributionData: any = []; // 模块分配显示的数据
    tblloading = false; // 控制表格的loading状态
    loading = false; // 控制提交按钮的loading状态
    searchloading = false; // 控制查询按钮的loading状态
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    copyData3: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    showSub: boolean; // 控制子模块的显示隐藏

    constructor(private router: Router, private xlsx: XlsxService, private fb: FormBuilder, private http: _HttpClient, private message: NzMessageService) { }

    ngOnInit() {
        this.localUname = localStorage.getItem('uname');
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            status: [null, [Validators.required]],
            memo: [null, []],
            id: [null, []]
        });

        this.mformGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: [null, [Validators.required]],
            parent_module: [null, [Validators.required]],
            description: [null, []],
            pre_time: [null, [Validators.required]],
            submodule: [null, [Validators.required]],
            uname: [null, []],
            id: [null, []]
        });
        this.getList(); // 调用获取列表数据的方法
        this.formGroupAssess = this.fb.group({
            assess: [null, [Validators.required]],
            problems: [null, [Validators.required]],
            id: [null, []]
        });
        this.formGroupAssess = this.fb.group({
            assess: [null, [Validators.required]],
            problems: [null, [Validators.required]],
            id: [null, []]
        });
    }

    getData(pram) {
        if (pram === 1) {
            this.http.get(`/user_manager/index_info?uname=${localStorage.getItem('uname')}&tableData=1`).subscribe(res => {
                this.tblloading = false;
                this.tbltotal1 = res['msg'].length;
                this.tableData1 = res['msg'];
                this.copyData = res['msg'];
            });
        } else if ( pram === 2 ) {
            this.http.get(`/user_manager/index_info?uname=${localStorage.getItem('uname')}&tableData=2`).subscribe(res => {
                this.tblloading = false;
                this.tbltotal = res['msg'].length;
                this.tableData = res['msg'];
                this.copyData = res['msg'];
            });
        } else {
              this.http.get(`/user_manager/index_info?uname=${localStorage.getItem('uname')}&tableData=3`).subscribe(res => {
                  this.tblloading = false;
                  this.tbltotal3 = res['msg'].length;
                  this.tableData3 = res['msg'];
                  // this.copyData3 = res['msg'];
              });

        }
    }

    /* 获取数据的方法 */
    getList(): void {
        this.http.get(`/user_manager/index_info?uname=${localStorage.getItem('uname')}&tableData=1`).subscribe(res => {
            this.tblloading = false;
            this.tbltotal1 = res['msg'].length;
            this.tableData1 = res['msg'];
            this.copyData = res['msg'];
        });
        this.http.get('/project_model_test/distribution_module').subscribe(res => {
            this.distributionData = res['msg'];
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
                this.mformGroup.value.parent_module = null;
                this.mformGroup.reset(this.mformGroup.value);
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
                this.mformGroup.value.submodule = null;
                this.mformGroup.reset(this.mformGroup.value);
                this.submoduleSlt = arr;
            });
        }
    }
    /* 添加之前执行的方法 */
    befAdd() {
        // 重置表单
        this.mformGroup.reset();
        this.parent_moduleSlt = [];
        this.isUnameDisabled = true;
        this.unameOption = localStorage.getItem('uname');
        this.versionSlt = [];
        // 弹出modialog
        this.modalVisible1 = true;
    }
    /* 为自己添加模块 */
    addOrUplModule() {
        const self = this;
        for (const i in self.mformGroup.controls) {
            self.mformGroup.controls[i].markAsDirty();
            self.mformGroup.controls[i].updateValueAndValidity();
        }
        if (self.mformGroup.valid) {
            self.loading = true;
            self.mformGroup.value['pre_time'] = moment(self.mformGroup.value['pre_time']).format('YYYY-MM-DD HH:mm:ss');
            self.mformGroup.value['submodule'] = Array.isArray(self.mformGroup.value['submodule']) ? self.mformGroup.value['submodule'].join(',') : self.mformGroup.value['submodule'];
            self.mformGroup.value['rname'] = self.unameSlt.filter(data => data.value === self.mformGroup.value['uname'])[0].label;
            const disData = self.distributionData.filter(data => data.name === self.mformGroup.value['name'] && data.version === self.mformGroup.value['version'] && data.parent_module === self.mformGroup.value['parent_module'] && data.uname === self.mformGroup.value['uname']);
            const copyArr = [];
            for (let i = 0; i < disData.length; i++) {
                if (self.mformGroup.value['submodule'].indexOf(disData[i].submodule) >= 0) {
                    copyArr.push(disData[i].submodule);
                }
            }
            if (copyArr.length) {
                self.message.error('已为' + self.mformGroup.value['rname'] + '分配“' + copyArr.join(',') + '”子模块');
                self.loading = false;
                return;
            }
            self.http.post('/project_model_test/distribution_module', self.mformGroup.value)
                .subscribe(
                    (data) => {
                        self.loading = false;
                        self.modalVisible1 = false;
                        self.message.success('提交成功');
                    },
                    err => {
                        self.loading = false;
                        self.modalVisible1 = false;
                        self.message.success('提交失败');
                    }
                );
        }
    }
    /*修改前执行的方法 */
    befEdit(rowData, pram) {
        this.loading = false;
        // 设置弹框title
        this.addOrUpldTitle = '编辑';
        if (pram) {
            // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
            // 显示弹出框
            this.modalAssess = true;
            // 使表单不可修改
            this.isFormDisabled = true;
            this.formGroupAssess.reset(rowData);
        } else {
            // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
            // 显示弹出框
            this.modalVisible = true;
            // 使表单不可修改
            this.isFormDisabled = true;
            this.formGroup.reset(rowData);
        }
        this.ajaxType = 'put';
    }


    /* 查询 */
    doSearch(pram) {
        if (pram === 1) {
            this.searchloading = true;
            if (this.q['operate_time_test']) {
                this.q['startdate'] = moment(this.q.operate_time_test[0]).format('YYYY-MM-DD HH:mm:ss');
                this.q['enddate'] = moment(this.q.operate_time_test[1]).format('YYYY-MM-DD HH:mm:ss');
                this.q['search_time'] = 'tab1';
            }
            this.http.get(`/user_manager/index_info`, this.q)
                .subscribe(
                    (data) => {
                        this.tbltotal1 = data['msg'].length;
                        this.tableData1 = data['msg'];
                        this.searchloading = false;
                        this.message.success('查询成功');
                    },
                    err => {
                        this.searchloading = false;
                        this.message.success('查询失败');
                    }
                );
        } else if (pram === 3) {
            this.searchloading = true;
            this.q['tableData'] = 3;
            
            this.http.get(`/user_manager/index_info`, this.q)
                .subscribe(
                    (data) => {
                        this.tbltotal3 = data['msg'].length;
                        this.tableData3 = data['msg'];
                        this.searchloading = false;
                        this.message.success('查询成功');
                    },
                    err => {
                        this.searchloading = false;
                        this.message.success('查询失败');
                    }
                );
        } else {
            this.searchloading = true;
            if (this.q['operate_time_admin']) {
                this.q['startdate'] = moment(this.q.operate_time_admin[0]).format('YYYY-MM-DD HH:mm:ss');
                this.q['enddate'] = moment(this.q.operate_time_admin[1]).format('YYYY-MM-DD HH:mm:ss');
                this.q['search_time'] = 'tab2';
            }
            this.http.get(`/user_manager/index_info`, this.q)
                .subscribe(
                    (data) => {
                        this.tbltotal = data['msg'].length;
                        this.tableData = data['msg'];
                        this.searchloading = false;
                        this.message.success('查询成功');
                    },
                    err => {
                        this.searchloading = false;
                        this.message.success('查询失败');
                    }
                );
        }
    }

    // 评估结果列集
    columns = [
        { title: '负责人', index: 'uname' },
        { title: '项目名称', index: 'name' },
        { title: '版本号', index: 'version' },
        { title: '父模块', index: 'parent_module' },
        { title: '子模块', index: 'submodule' },
        { title: '自测', index: 'status' },
        { title: '评估', index: 'assess' },
        { title: '存在问题', index: 'problems' },
        { title: '操作时间', index: 'operate_time_admin' },
    ];

    // 自测结果列集
    columnstest = [
        { title: '负责人', index: 'uname' },
        { title: '项目名称', index: 'name' },
        { title: '版本号', index: 'version' },
        { title: '父模块', index: 'parent_module' },
        { title: '子模块', index: 'submodule' },
        { title: '状态', index: 'status' },
        { title: '备注', index: 'memo' },
        { title: '操作时间', index: 'operate_time_test' },
    ];

    // 成功率显示
    columnsrate = [
        { title: '负责人', index: 'uname' },
        { title: '项目名称', index: 'name' },
        { title: '版本号', index: 'version' },
        { title: '负责模块', index: 'resultrate' },
        { title: '自测率', index: 'successrate' },
        { title: '总完成率', index: 'completionrate' }
    ];

    /* 导出 */
    download(pram) {
        /* 评估结果 */
        if (pram === 2) {
            const data = [this.columns.map(i => i.title)];
            this.tableData.forEach(i => data.push(this.columns.map(c => {

                if (c.index === 'status') {
                    if (i[c.index as string]) {
                        return this.statusSlt.filter(a => a.value === i[c.index as string])[0].label;
                    }
                } else if (c.index === 'assess') {
                    if (i[c.index as string]) {
                        return this.statusSlt.filter(a => a.value === i[c.index as string])[0].label;
                    }
                } else {
                    return i[c.index as string];
                }

                // if (c.index === 'status') {
                //     return this.statusSlt.map(a => {
                //         if (a.value === i[c.index as string]) {
                //             return a.label;
                //         }
                //     });
                // } else if (c.index === 'assess') {
                //     return this.statusSlt.map(a => {
                //         if (a.value === i[c.index as string]) {
                //             return a.label;
                //         }
                //     });
                // } else {
                //     return i[c.index as string];
                // }
            })));
            this.xlsx.export({
                sheets: [
                    {
                        data: data,
                        name: '评估结果'
                    }
                ],
                filename: `评估结果${moment().format('YYYYMMDDHHmmss')}.xlsx`
            });
        } else if (pram === 3) { 
            const data = [this.columnsrate.map(i => i.title)];
            this.tableData3.forEach(i => data.push(this.columnsrate.map(c => {
                    return i[c.index as string];
            })));
            this.xlsx.export({
                sheets: [
                    {
                        data: data,
                        name: '成功自测率'
                    }
                ],
                filename: `成功自测率${moment().format('YYYYMMDDHHmmss')}.xlsx`
            });
        } else {
            const data = [this.columnstest.map(i => i.title)];
            this.tableData1.forEach(i => data.push(this.columnstest.map(c => {
                if (c.index === 'status') {
                    if (i[c.index as string]) {
                        return this.statusSlt.filter(a => a.value === i[c.index as string])[0].label;
                    }
                } else {
                    return i[c.index as string];
                }
            })));
            this.xlsx.export({
                sheets: [
                    {
                        data: data,
                        name: '自测结果'
                    }
                ],
                filename: `自测结果${moment().format('YYYYMMDDHHmmss')}.xlsx`
            });
        }
    }
    /* 保存 */
    addOrUpl(pram) {
        const self = this;
        self.loading = true;

        if (pram) {
            /* 验证用 */
            for (const i in self.formGroupAssess.controls) {
                self.formGroupAssess.controls[i].markAsDirty();
            }
            if (self.formGroupAssess.valid) {
                self.formGroupAssess.value['uname'] = localStorage.getItem('uname');
                self.formGroupAssess.value['flag'] = 'assessinfo';
                if (self.ajaxType === 'put') {
                    self.http.put('/user_manager/index_info', self.formGroupAssess.value)
                        .subscribe(
                            (data) => {
                                self.loading = false;
                                self.modalAssess = false;
                                self.tableData = data.msg;
                                if (data.success) {
                                    self.message.success('更新成功');
                                } else {
                                    self.message.warning(data.msg);
                                }
                            },
                            err => {
                                self.loading = false;
                                self.modalAssess = false;
                                self.message.success('更新失败');
                            }
                        );
                }
            }
        } else {
            for (const i in self.formGroup.controls) {
                self.formGroup.controls[i].markAsDirty();
            }
            if (self.formGroup.valid) {
                self.formGroup.value['uname'] = localStorage.getItem('uname');
                self.formGroup.value['flag'] = 'testinfo';
                if (self.ajaxType === 'put') {
                    self.http.put('/user_manager/index_info', self.formGroup.value)
                        .subscribe(
                            (data) => {
                                self.loading = false;
                                self.modalVisible = false;
                                self.tbltotal1 = data['msg'].length;
                                self.tableData1 = data.msg;
                                if (data.success) {
                                    self.message.success('更新成功');
                                } else {
                                    self.message.warning(data.msg);
                                }
                            },
                            err => {
                                self.loading = false;
                                self.modalVisible = false;
                                self.message.success('更新失败');
                            }
                        );
                }/*  else {
                self.http.post(`/user_manager/index_info`, self.formGroup.value)
                    .subscribe(
                        (data) => {
                            self.tableData = data['msg'];
                            self.loading = false;
                            self.modalVisible = false;
                            self.message.success('提交成功');
                        },
                        err => {
                            self.loading = false;
                            self.modalVisible = false;
                            self.message.success('提交失败');
                        }
                    );
            } */
            }

        }
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
