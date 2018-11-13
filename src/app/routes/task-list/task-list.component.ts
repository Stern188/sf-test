import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
    q: any = { flag: 1 }; // 查询表单
    expandForm = false; // 控制查询表单的显示隐藏
    searchloading = false; // 控制查询按钮的loading状态
    formGroup: FormGroup;
    addOrUpldTitle: string; // 定义modialog头部title变量
    ajaxType: string; // 定义ajax标识ajaxType=post(添加)；ajaxType=put(修改)
    isFormDisabled: boolean; // 定义表单是否可填
    modalVisible = false; // 控制modal的显示与否
    tableData: any = []; // 表格实际显示的数据
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    loading = false; // 控制modal框内提交按钮的loading状态

    constructor(private fb: FormBuilder,
        private http: _HttpClient, private message: NzMessageService
    ) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: [null, [Validators.required]],
            description: [null, []]
        }, );
        this.getList(); // 调用获取数据的方法
    }

    /* 获取数据的方法 */
    getList(): void {
        this.http.get('/project-manage/projects').subscribe(res => {
            this.tableData = res['msg'];
            this.copyData = res['msg'];
        });
    }

    /* 添加执行的方法 */
    befAdd() {
        // 设置弹框title
        this.addOrUpldTitle = '添加';
        // 重置表单
        this.formGroup.reset();
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
        this.addOrUpldTitle = '修改';
        // 给表单赋值
        this.formGroup.reset(rowData);
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'put';
        // 显示弹出框
        this.modalVisible = true;
        // 使项目名称不可修改
        this.isFormDisabled = true;
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

    /* 保存和修改 */
    addOrUpl() {
        for (const i in this.formGroup.controls) {
            this.formGroup.controls[i].markAsDirty();
        }
        if (this.formGroup.valid) {
            this.loading = true;
            if (this.ajaxType === 'put') {
                this.http.put('/project-manage/projects', this.formGroup.value)
                    .subscribe(
                        (data) => {
                            this.tableData = data['msg'];
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success('更新成功');
                        },
                        err => {
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success('更新失败');
                        }
                    );
            } else {
                if (this.tableData.filter(data => data.name === this.formGroup.value['name']).length) {
                    this.loading = false;
                    this.message.warning('已存在该项目');
                    return;
                }
                this.http.post('/project-manage/projects', this.formGroup.value)
                    .subscribe(
                        (data) => {
                            this.tableData = data['msg'];
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success('提交成功');
                        },
                        err => {
                            this.loading = false;
                            this.modalVisible = false;
                            this.message.success('提交失败');
                        }
                    );
            }
        }
    }

    /* 删除 */
    del(name: string) {
        this.http.get('/project_model_test/module_info').subscribe(mod => {
            const modlen = mod['msg'].filter(data => data.name === name);
            if (modlen.length) {
                this.message.warning('请先删除该项目下的所有模块');
            } else {
                this.http.get('/project-manage/versions').subscribe(ver => {
                    const verlen = ver['msg'].filter(data => data.name === name);
                    if (verlen.length) {
                        this.message.warning('请先删除该项目下的所有版本号');
                    } else {
                        this.http.delete('/project-manage/projects', { name: name })
                            .subscribe(
                                (data) => {
                                    this.tableData = data['msg'];
                                    this.message.success('删除成功');
                                },
                                err => this.message.error('删除失败')
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
        this.q = {};
    }
}
