import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { OperationLogService } from './operation-log.service';
import { CommonService } from '../../../common.service';

@Component({
    selector: 'app-operation-log',
    templateUrl: './operation-log.component.html',
    providers: [OperationLogService,CommonService]
})
export class OperationLogComponent implements OnInit {
    recordData: any[] = [];//用户表格数据
    _current = 1;//当前页
    _pageSize = 10;//单页条数
    _total = 1;//总条数
    tblTotal = 1;//总条数
    _loading = true;//表格loading
    // _sortValue = null;//
    // copyData: any[] = [];//备份用户表格数据-用于表格筛选
    isVisible: boolean = false;//添加、修改用户的对话框状态
    userTitle: string = '';//添加、修改用户对话框表头
    ajaxType: string = '';//添加、修改交互类型
    searchloading: boolean = false;//查询按钮Loading状态

    searchGroup: FormGroup;//用户添加、修改图表数据
    expandForm: boolean = false;//查询项显隐
    doSearchTag: boolean = false;//查询标记

    constructor(private http: _HttpClient, public message: NzMessageService, private fb: FormBuilder, private OperationLogService: OperationLogService,private commonService: CommonService,) { }
    private initUrl = `/user_manager/logging`;//用来获取用户的接口

    ngOnInit() {
        /*模拟服务器异步加载*/
        setTimeout(_ => {
        }, 100);
        this.searchGroup = this.fb.group({
            uname: [null],
            status: [null],
            log_type: [null],
            info: [null],
            operate_time: [null],
            host_ip: [null],
        });
        this._getRecordData();
    }
    /* 获取用户数据 */
    _getRecordData(searchData: any = {}) {
        // this.recordData = [{uname:'yi23',comment:'ddsedf',map_name:'普通管理员'},{uname:'321',comment:'edf',map_name:'普通管理员'},{uname:'231',comment:'sdddsedf',map_name:'超级管理员'}];
        // this.copyData = [ ...this.recordData ];
        /* this.http.get(`${this.initUrl}`).subscribe((res:any) => {
            if(res['success']){
                this.recordData = res.msg;
                // this.copyData = res['msg'];
            }else{
                this.message.error(this.commonService.fanyi('tip.fetch-data-failed'));
            }
        }); */
        if (this.doSearchTag) {
            searchData = this.searchGroup.value;
            if (searchData['operate_time']) {
                searchData['startdate'] = moment(searchData['operate_time'][0]).format("YYYY-MM-DD HH:mm:ss");
                searchData['enddate'] = moment(searchData.operate_time[1]).format("YYYY-MM-DD HH:mm:ss");
            }
            searchData['flag'] = 1;
        }
        this.searchloading = true;
        this._loading = true;
        this.OperationLogService.getUsers(this._current, this._pageSize, searchData).subscribe(
            (data: any) => {
                this._loading = false;
                this.searchloading = false;
                if (data['success']) {
                    this._total = data.msg.meta.total;
                    this.recordData = data.msg.logininfo;
                } else {
                    this.message.error(this.commonService.fanyi('tip.fetch-data-failed'));
                }
            },
            err => {
                this._loading = false;
                this.searchloading = false;
                this.message.success(this.commonService.fanyi('tip.query-fail'));
            }
        );
    }
    /* 改变分页基数 */
    pageSizeChange() {
        this._current = 1;
        this._getRecordData();
    }

    /* 表格查询功能 */
    doSearch() {
        // console.log(this.searchGroup.value)
        this.doSearchTag = true;
        // let searchData = this.searchGroup.value;
        // if (searchData['operate_time']) {
        //     searchData['startdate'] = moment(searchData.operate_time[0]).format("YYYY-MM-DD HH:mm:ss");
        //     searchData['enddate'] = moment(searchData.operate_time[1]).format("YYYY-MM-DD HH:mm:ss");
        // }
        // searchData['flag'] = 1;
        /* this.http.get(`${this.initUrl}`, searchData)
            .subscribe(
                (data) => {
                    if(data['success']){
                        this.recordData = data['msg'];
                        this.message.success(this.commonService.fanyi('tip.query-success'));
                    }else{
                        this.message.error(this.commonService.fanyi('tip.query-fail'));
                    }
                },
                err => {
                    this.message.success(this.commonService.fanyi('tip.query-fail'));
                }
            ); */
        this._current = 1;
        this._getRecordData();
    }
    doReset() {
        this.doSearchTag = false;
        this.searchGroup.reset({});//重置表单
    }
    /*以下为表格搜索和排序功能 */
    sortMap = {
        uname: null,
        status: null,
        log_type: null,
        info: null,
        operate_time: null,
        host_ip: null,
    };
    // filterMapnameArray = [
    //     { name: '普通管理员', value: false },
    //     { name: '超级管理员', value: false }
    // ];
    // unameVal:string = '';//
    sortName: string = '';//排序字段
    sortValue: string = '';//排序方式
    sort(sortName: string, value: any) {
        this.sortName = sortName;
        this.sortValue = value;
        Object.keys(this.sortMap).forEach(key => {
            if (key !== sortName) {
                this.sortMap[key] = null;
            } else {
                this.sortMap[key] = value;
            }
        });
        this.search();
    }
    // reset() {
    //     this._getRecordData(this._current,this._pageSize,{});
    // }
    search() {
        /* const searchMapname = this.filterMapnameArray.filter(name => name.value);
        const filterFunc = (item) => {
            let mapnameSrc = searchMapname.length ? searchMapname.some(mapname => item.map_name.indexOf(mapname.name) !== -1) : true,
                unameSrc = item.uname.indexOf(this.unameVal) !== -1;
            return mapnameSrc && unameSrc;
        };
        this.recordData = [ ...this.copyData.filter(item => filterFunc(item)) ]; *///搜索功能
        this.recordData = [...this.recordData.sort((a, b) => {
            if (a[this.sortName] > b[this.sortName]) {
                return (this.sortValue === 'ascend') ? 1 : -1;
            } else if (a[this.sortName] < b[this.sortName]) {
                return (this.sortValue === 'ascend') ? -1 : 1;
            } else {
                return 0;
            }
        })];
    }

}

