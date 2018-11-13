import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from '../../../common.service';

@Component({
    providers: [CommonService],
    selector: 'app-projects',
    templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
    q: any = { flag: 1 }; // 查询表单
    expandForm = false; // 控制查询表单的显示隐藏
    searchloading = false; // 控制查询按钮的loading状态
    formGroup: FormGroup;
    tbltotal: number; // 表格总条数
    addOrUpldTitle: string; // 定义modialog头部title变量
    ajaxType: string; // 定义ajax标识ajaxType=post(添加)；ajaxType=put(修改)
    isFormDisabled: boolean; // 定义表单是否可填
    modalVisible = false; // 控制modal的显示与否
    tableData: any = []; // 表格实际显示的数据
    projectnameSlt: any = []; // 显示项目下拉数据
    versionSlt: any = []; // 显示版本下拉数据
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    loading = false; // 控制modal框内提交按钮的loading状态
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private http: _HttpClient, private message: NzMessageService
    ) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: ['V1.0', [Validators.required]],
            description: [null, []]
        });
        this.getList(); // 调用获取数据的方法
    }

    /* 获取数据的方法 */
    getList(): void {
        this.http.get('/project-manage/projects').subscribe(res => {
            this.tbltotal = res['msg'].length;
            this.tableData = res['msg'];
            this.copyData = res['msg'];
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                arr.push({ label: res['msg'][index].name, value: res['msg'][index].name });
            }
            this.projectnameSlt = arr;
        });
    }
    /* 项目下拉改变时触发 */
    getVersion(data) {
        this.http.get('/project-manage/versions').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                if (!data) {
                    this.q.version = null;
                    break;
                }
                if (res['msg'][index].name === data) {
                    arr.push({ label: res['msg'][index].version, value: res['msg'][index].version });
                }
            }
            this.versionSlt = arr;
        });
    }

    /* 添加执行的方法 */
    befAdd() {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.add');
        // 重置表单
        this.formGroup.reset({ version: 'V1.0' });
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'post';
        // 使表单可修改
        this.isFormDisabled = false;
        // 弹出modialog
        this.modalVisible = true;
    }

    /*修改前执行的方法 */
    befEdit(rowData) {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.modify');
        // 给表单赋值
        this.formGroup.reset(rowData);
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'put';
        // 使项目名称不可修改
        this.isFormDisabled = true;
        // 显示弹出框
        this.modalVisible = true;
    }

    /* 查询 */
    doSearch() {
        this.searchloading = true;
        if (this.q['operate_time']) {
            this.q['startdate'] = moment(this.q.operate_time[0]).format('YYYY-MM-DD HH:mm:ss');
            this.q['enddate'] = moment(this.q.operate_time[1]).format('YYYY-MM-DD HH:mm:ss');
        }
        this.http.get(`/project-manage/projects`, this.q)
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
        this.loading = true;
        if (this.ajaxType === 'put') {
            this.http.put('/project-manage/projects', this.formGroup.value)
                .subscribe(
                    (data) => {
                        this.tableData = data['msg'];
                        this.loading = false;
                        this.modalVisible = false;
                        this.message.success(this.commonService.fanyi('tip.update-success'));
                    },
                    err => {
                        this.loading = false;
                        this.modalVisible = false;
                        this.message.success(this.commonService.fanyi('tip.update-fail'));
                    }
                );
        } else {
            for (const i in this.formGroup.controls) {
                this.formGroup.controls[i].markAsDirty();
            }
            if (this.formGroup.valid) {
                if (this.tableData.filter(data => data.name === this.formGroup.value['name']).length) {
                    this.loading = false;
                    this.message.warning(this.commonService.fanyi('project-manage.projects.the-project-already-exists'));
                    return;
                }
                this.http.post('/project-manage/projects', this.formGroup.value)
                    .subscribe(
                        (data) => {
                            this.tableData = data['msg'];
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success(this.commonService.fanyi('tip.submitted-success'));
                        },
                        err => {
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success(this.commonService.fanyi('tip.submitted-fail'));
                        }
                    );
            } else {
                this.loading = false;
            }
        }
    }

    /* 删除 */
    del(name: string) {
        this.http.get('/project_model_test/module_info?parent_sub=1').subscribe(mod => {
            const modlen = mod['msg'].filter(data => data.name === name);
            if (modlen.length) {
                this.message.warning(this.commonService.fanyi('project-manage.projects.delete-all-version-Numbers-first'));
            } else {
                this.http.get('/project-manage/versions').subscribe(ver => {
                    const verlen = ver['msg'].filter(data => data.name === name);
                    if (verlen.length) {
                        this.message.warning(this.commonService.fanyi('project-manage.projects.delete-all-version-Numbers-first'));
                    } else {
                        this.http.delete('/project-manage/projects', { name: name })
                            .subscribe(
                                (data) => {
                                    this.tableData = data['msg'];
                                    this.message.success(this.commonService.fanyi('tip.delete-success'));
                                },
                                err => this.message.error(this.commonService.fanyi('tip.delete-fail'))
                            );
                    }
                });
            }
        });
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
