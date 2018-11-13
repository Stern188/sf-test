import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from '../../../common.service';


@Component({
 providers: [CommonService],
    selector: 'app-versions',
    templateUrl: './versions.component.html',
})
export class VersionsComponent implements OnInit {
    checked = true; // 是否选中继承上一版本信息
    q: any = { flag: 1 }; // 查询表单
    expandForm = false; // 控制查询表单的显示隐藏
    searchloading = false; // 控制查询按钮的loading状态
    formGroup: FormGroup;
    tbltotal: number; // 表格总条数
    addOrUpldTitle: string; // 定义modialog头部title变量
    ajaxType: string; // 定义ajax标识ajaxType=post(添加)；ajaxType=put(修改)
    isFormDisabled: boolean; // 定义表单是否可填
    isSDisabled: boolean; // 定义表单状态是否可填
    modalVisible = false; // 控制modal的显示与否
    tableData: any = []; // 表格实际显示的数据
    copyData: any = []; // 存放表格中后台最新的数据，用来给搜索使用
    loading = false; // 控制modal框内提交按钮的loading状态
    projectnameSlt: any; // 项目选择下拉值
    versionSlt: any = []; // 显示版本下拉数据
    nameOption: string; // 项目下拉值
    ischk = false; // 是否继承上一版本内容
    statusSlt = [
        { label:this.commonService.fanyi('btn.take-effect'), value: true },
        { label:this.commonService.fanyi('btn.lose-efficacy'), value: false },
    ];
    constructor(private fb: FormBuilder,
        private http: _HttpClient, private message: NzMessageService,  private commonService: CommonService,
    ) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [null, [Validators.required]],
            version: [null, [Validators.required]],
            status: [null, [Validators.required]],
            description: [null, []]
        }, );
        this.getList(); // 调用获取项目数据的方法
    }

    /* 获取版本数据的方法 */
    getList(): void {
        this.http.get('/project-manage/projects').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg']['length']; index++) {
                arr.push({ label: res['msg'][index].name, value: res['msg'][index].name });
            }
            this.projectnameSlt = arr;
        });
        this.http.get('/project-manage/versions').subscribe(res => {
            this.tbltotal = res['msg'].length;
            this.tableData = res['msg'];
            this.copyData = res['msg'];
        });
    }

    /* 项目下拉改变时触发 */
    getVersion(data) {
        let hasStatus = false;
        this.http.get('/project-manage/versions').subscribe(res => {
            const arr = [];
            for (let index = 0; index < res['msg'].length; index++) {
                if (!data) {
                    this.q.version = null;
                    break;
                }
                if (res['msg'][index].name === data) {
                    arr.push({ label: res['msg'][index].version, value: res['msg'][index].version });
                    // 重置表单
                    this.isSDisabled = false;
                    hasStatus = true;
                    break;
                }
            }
            this.versionSlt = arr;
            if (!hasStatus) {
                this.isSDisabled = true;
            }
        });
    }

    /* 添加之前执行的方法 */
    befAdd() {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.add');
        // 重置表单
        this.formGroup.reset({ 'status': true });
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'post';
        // 使项目名称可修改
        this.isFormDisabled = false;
        // 弹出modialog
        this.modalVisible = true;
    }

    /*修改前执行的方法 */
    befEdit(rowData) {
        // 设置弹框title
        this.addOrUpldTitle = this.commonService.fanyi('btn.modify');
        if (rowData.status) {
            this.isSDisabled = true;
        } else {
            this.isSDisabled = false;
        }
        // 给表单赋值
        this.formGroup.reset(rowData);
        localStorage.setItem('version', rowData['version']);
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
        this.http.get(`/project-manage/versions`, this.q)
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
        for (const i in this.formGroup.controls) {
            this.formGroup.controls[i].markAsDirty();
        }
        if (this.formGroup.valid) {
            this.loading = true;
            if (this.ajaxType === 'put') {
                this.formGroup.value['old_version'] = localStorage.getItem('version');
                this.http.put('/project-manage/versions', this.formGroup.value)
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
                if (this.tableData.filter(data => data.name === this.formGroup.value['name'] && data.version === this.formGroup.value['version']).length) {
                    this.loading = false;
                    this.message.warning(this.commonService.fanyi('project-manage.versions.this-version-already-exists'));
                    return;
                }
                this.formGroup.value['type'] = document.getElementById('ischk')['checked'] || undefined;
                this.http.post('/project-manage/versions', this.formGroup.value)
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
            }
        }
    }

    /* 删除 */
    del(data) {
        this.http.get('/project_model_test/module_info?parent_sub=1').subscribe(mod => {
            const modlen = mod['msg'].filter(ret => ret.name === data.name && ret.version === data.version);
            if (modlen.length) {
                this.message.warning(this.commonService.fanyi('project-manage.versions.delete-all-modules-under-number-first'));
            } else {
                if (this.tableData.filter(ret => ret.name === data.name).length > 1 && data.status) {
                    this.message.warning(this.commonService.fanyi('project-manage.versions.change-the-status-before-deleting'));
                    return;
                }
                this.http.delete('/project-manage/versions', { name: data.name, version: data.version })
                    .subscribe(
                        (ret) => {
                            this.tableData = ret['msg'];
                            this.message.success(this.commonService.fanyi('tip.delete-success'));
                        },
                        err => this.message.error(this.commonService.fanyi('tip.delete-fail'))
                    );
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
