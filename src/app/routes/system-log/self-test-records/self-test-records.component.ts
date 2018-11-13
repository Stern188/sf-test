import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-self-test-records',
  templateUrl: './self-test-records.component.html',
})
export class SelfTestRecordsComponent implements OnInit {
    recordData: any[] = [];//用户表格数据
    // copyData: any[] = [];//备份用户表格数据-用于表格筛选
    isVisible: boolean = false;//添加、修改用户的对话框状态
    userTitle: string = '';//添加、修改用户对话框表头
    ajaxType: string = '';//添加、修改交互类型
    searchloading: boolean = false;//对话框按钮isConfirmLoading状态
    searchGroup: FormGroup;//用户添加、修改图表数据
    expandForm: boolean = false;//查询项显隐

    constructor(private http: _HttpClient, public message: NzMessageService, private fb: FormBuilder) { }
    private initUrl = `/user_manager/logging`;//用来获取用户的接口

    ngOnInit() {
        /*模拟服务器异步加载*/
        setTimeout(_ => {
        }, 100);
        this.searchGroup = this.fb.group({
            user: [ null ],
            msg: [ null ],
            log_type: [ null ],
            info: [ null ],
            time: [ null ],
        });
        this._getRecordData();
    }
    /* 获取用户数据 */
    _getRecordData() {
        // this.recordData = [{uname:'yi23',comment:'ddsedf',map_name:'普通管理员'},{uname:'321',comment:'edf',map_name:'普通管理员'},{uname:'231',comment:'sdddsedf',map_name:'超级管理员'}];
        // this.copyData = [ ...this.recordData ];
        this.http.get(`${this.initUrl}`).subscribe(res => {
            this.recordData = res['msg'];
            // this.copyData = res['msg'];
        });
    }

    /* 表格查询功能 */
    doSearch(){
        console.log(this.searchGroup.value)
    }
    doReset(){
        this.searchGroup.reset({});//重置表单
    }
    /*以下为表格搜索和排序功能 */
    sortMap = {
        user: null,
        msg: null,
        log_type: null,
        info: null,
        time: null,
    };
    // filterMapnameArray = [
    //     { name: '普通管理员', value: false },
    //     { name: '超级管理员', value: false }
    // ];
    // unameVal:string = '';//
    sortName:string = '';//排序字段
    sortValue:string = '';//排序方式
    sort(sortName: string, value: any) {
        this.sortName = sortName;
        this.sortValue = value;
        Object.keys(this.sortMap).forEach(key => {
            if (key !== sortName) {
                this.sortMap[ key ] = null;
            } else {
                this.sortMap[ key ] = value;
            }
        });
        this.search();
    }
    reset() {
        this._getRecordData();
    }
    search(){
        /* const searchMapname = this.filterMapnameArray.filter(name => name.value);
        const filterFunc = (item) => {
            let mapnameSrc = searchMapname.length ? searchMapname.some(mapname => item.map_name.indexOf(mapname.name) !== -1) : true,
                unameSrc = item.uname.indexOf(this.unameVal) !== -1;
            return mapnameSrc && unameSrc;
        };
        this.recordData = [ ...this.copyData.filter(item => filterFunc(item)) ]; *///搜索功能
        this.recordData = [ ...this.recordData.sort((a, b) => {
            if (a[ this.sortName ] > b[ this.sortName ]) {
                return (this.sortValue === 'ascend') ? 1 : -1;
            } else if (a[ this.sortName ] < b[ this.sortName ]) {
                return (this.sortValue === 'ascend') ? -1 : 1;
            } else {
                return 0;
            }
        }) ];
    }

}
