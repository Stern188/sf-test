import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from '../../../common.service';

@Component({
    providers: [CommonService],
    selector: 'app-members',
    templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {
    SHA256: any = require('crypto-js/sha256');
    localName: any; // 登录用户名
    tbltotal: number; // 表格总条数
    userData: any[] = []; // 用户表格数据
    copyData: any[] = []; // 备份用户表格数据-用于表格筛选
    isVisible = false; // 添加、修改用户的对话框状态
    userTitle = ''; // 添加、修改用户对话框表头
    ajaxType = ''; // 添加、修改交互类型
    isConfirmLoading = false; // 对话框按钮Loading状态
    searchloading = false; // 查询按钮Loading状态
    userformGroup: FormGroup; // 用户添加、修改图表数据
    usersearchGroup: FormGroup; // 用户查询数据
    userdata_bef: any = {}; // 用户原数据
    pwdTitle = '默认密码为talent';
    //  usertype:any = {peopleUser:'普通管理员',adminUser:'超级管理员'};
    usertypesArray; // 用户类型组
    expandForm = false; // 查询项显隐

    constructor(private http: _HttpClient, public message: NzMessageService, private fb: FormBuilder, private router: Router,private commonService: CommonService) { }
    private memberUrl = `/user_manager/user_register`; //  用来获取用户的接口

    /* 添加用户--密码更新调用验证 */
    updatePwdValidator(a) {
        /** wait for refresh value */
        setTimeout(_ => {
            this.userformGroup.controls['repeat_pwd'].markAsDirty();
            this.userformGroup.controls['repeat_pwd'].updateValueAndValidity();
        });
    }
    /* repeat_pwd 验证 */
    repeatPwdValidator = (control: FormControl): { [s: string]: boolean } => {
        if (this.ajaxType === 'post') {
            /* if (!control.value) {
                return { required: true };
            } else  */if (control.value !== this.userformGroup.controls['pwd']['_pendingValue']) {
                return { a: true, error: true };
            }
        } else if (this.ajaxType === 'put') {
            return (!!control.value !== !!this.userformGroup.controls['pwd']['_pendingValue']) ? { a: true, error: true } : null;
        }
    }
    /* pwd验证 */
    /* pwdValidator = (control: FormControl): { [s: string]: boolean } => {
        //  console.log(control)
        return (this.ajaxType === 'post') ? (control.value ? null : { required: true }) : null;
    } */
    ngOnInit() {
        /*模拟服务器异步加载*/
        //  setTimeout(_ => {
        //      this.usertypesArray = [{text:'普通管理员',value:'普通管理员'},{text:'超级管理员',value:'超级管理员'}];
        //  }, 100);
        this.localName = window.localStorage.uname;
        this.usersearchGroup = this.fb.group({
            uname: [null],
            rname: [null],
            map_name: [null],
            comment: [null],
            email: [null],
        });
        this._setValid();
        this._getUserData();
        this._getMapname(); // 获取角色类型
    }
    /* 转译用户名 */
    /* _translateUser(data,type){
        return data.map((item) => {
            item.map_name_ch = type[item.map_name]?type[item.map_name]:item.map_name;
        });
    } */
    _setValid() {
        this.userformGroup = this.fb.group({
            uname: [null, Validators.compose([Validators.required, Validators.pattern(`[a-zA-Z0-9\u4E00-\u9FA5_]{2,18}`)])],
            rname: [null, Validators.compose([Validators.required, Validators.pattern(`[\u4E00-\u9FA5]{2,4}`)])],
            map_name: [null, [Validators.required]],
            pwd: [null, []],
            // pwd: [null, [this.pwdValidator]],
            repeat_pwd: [null, [this.repeatPwdValidator]],
            email: [null, Validators.compose([Validators.required, Validators.pattern(/[\w!#$ %& '*+/=?^_`{|}~-]+(?: \.[\w!#$ %& ' * +/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/)])],
            comment: [null, Validators.maxLength(500)]
        });
    }
    /* 获取用户数据 */
    _getUserData() {
        this.http.get(`${this.memberUrl}`).subscribe(res => {
            if (res['success']) {
                this.tbltotal = res['msg'].length;
                this.userData = res['msg'];
                this.copyData = res['msg'];
            } else {
                this.message.error(this.commonService.fanyi('tip.fetch-data-failed'));
            }
        });
    }
    /* 获取角色类型 */
    _getMapname() {
        this.http.get(`${this.memberUrl}`, { flag: 2 }).subscribe(res => {
            if (res['success']) {
                this.usertypesArray = res['msg'];
            } else {
                this.message.error(this.commonService.fanyi('tip.fetch-data-failed'));
            }
        });
    }
    /* 获取在线用户数据的方法 */
    _getOnlineusersData() {

    }
    /* 删除用户 */
    del(uname: string) {
        this.http.delete(`${this.memberUrl}`, { uname: uname })
            .subscribe(
                (data) => {
                    if (data['success']) {
                        this.userData = data.msg;
                        this.message.success(this.commonService.fanyi('tip.delete-success'));
                    } else {
                        this.message.error(this.commonService.fanyi('tip.delete-fail'));
                    }
                },
                err => this.message.error(this.commonService.fanyi('tip.delete-fail'))
            );
    }
    //  添加用户触发事件
    befUserAdd() {
        this.userTitle = this.commonService.fanyi('plugin.add-user');
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'post';
        //  this._getMapname();// 获取角色类型
        this._setValid(); // 重置验证
        this.userformGroup.reset({ 'map_name': '1', 'pwd': 'talent', 'repeat_pwd': 'talent' });// 重置表单
        this.isVisible = true;
    }
    //  编辑用户触发事件
    befUserEdit(item) {
        //  console.log(item)
        this.userTitle =  this.commonService.fanyi('plugin.edit-user');
        // 设置标识ajaxType=post(添加)；ajaxType=put(修改)
        this.ajaxType = 'put';
        //  this._getMapname();// 获取角色类型
        this._setValid(); // 重置验证
        for (let i = 0; i < this.usertypesArray.length; i++) {
            if (this.usertypesArray[i].text === item.map_name) {
                item['map_name'] = this.usertypesArray[i].value;
            }
        }
        this.userformGroup.reset(item); // 重置表单
        this.userdata_bef = item; // 存储用户原数据
        this.isVisible = true;
    }
    //  关闭对话框
    handleCancel = (e) => {
        this.isVisible = false;
    }
    //  确认添加/编辑用户触发事件
    userAddOrUpl(e) {
        const self = this;
        //  console.log(self.userformGroup)
        for (const i in self.userformGroup.controls) {
            self.userformGroup.controls[i].markAsDirty();
        }
        if (self.userformGroup.valid) {
            //  console.log(self.userformGroup.value)
            self.isConfirmLoading = true;
            //  self.userformGroup.value['uname'] = self.userformGroup.value['prover'][0];
            const data = self.userformGroup.value;
            const pwdedit = data.pwd && data.repeat_pwd && (data.pwd === data.repeat_pwd);
            // Object.setPrototypeOf(data, {
            //     pwd:/* data['pwd']?self.SHA256(data.pwd).toString():'' */1,
            //     repeat_pwd:data['pwd']?self.SHA256(data.pwd).toString():''
            // });
            data['pwd'] = data['pwd'] ? self.SHA256(data.pwd).toString() : '';
            data.repeat_pwd = data.repeat_pwd ? self.SHA256(data.repeat_pwd).toString() : '';
            if (self.ajaxType === 'put') {
                self.http.put(`${self.memberUrl}`, data)
                    .subscribe(
                        (res) => {
                            if (res['success']) {
                                self.userData = res['msg'];
                                self.message.success(this.commonService.fanyi('tip.update-success'));
                                if ((data.uname === this.localName) && (pwdedit || (data.map_name !== this.userdata_bef.map_name))) {
                                    this.router.navigate(['/passport/login']);
                                }
                            } else {
                                self.message.error(this.commonService.fanyi('tip.update-fail'));
                            }
                            self.isConfirmLoading = false;
                            self.isVisible = false;
                        },
                        err => {
                            self.isConfirmLoading = false;
                            self.isVisible = false;
                            self.message.error(this.commonService.fanyi('tip.update-fail'));
                        }
                    );
            } else if (self.ajaxType === 'post') {
                const hasUname = self.userData.filter(ret => ret.uname === self.userformGroup.value['uname']).length;
                if (hasUname) {
                    self.isConfirmLoading = false;
                    self.message.warning(this.commonService.fanyi('tip.user-already-exists'));
                    return;
                }
                self.http.post(`${self.memberUrl}`, self.userformGroup.value)
                    .subscribe(
                        (ret) => {
                            if (ret['success']) {
                                self.userData = ret['msg'];
                                self.message.success(this.commonService.fanyi('tip.submitted-success'));
                            } else {
                                self.message.error(this.commonService.fanyi('tip.submitted-fail'));
                            }
                            self.isConfirmLoading = false;
                            self.isVisible = false;
                        },
                        err => {
                            self.isConfirmLoading = false;
                            self.isVisible = false;
                            self.message.error(this.commonService.fanyi('tip.submitted-fail'));
                        }
                    );
            }
        }
    }

    /* 表格查询功能 */
    doSearch() {
        const searchData = this.usersearchGroup.value;
        searchData['flag'] = 1;
        this.searchloading = true;
        this.http.get(`${this.memberUrl}`, searchData)
            .subscribe(
                (data) => {
                    this.searchloading = false;
                    if (data['success']) {
                        this.tbltotal = data['msg'].length;
                        this.userData = data['msg'];
                        this.message.success(this.commonService.fanyi('tip.query-success'));
                    } else {
                        this.message.error(this.commonService.fanyi('tip.query-fail'));
                    }
                },
                err => {
                    this.searchloading = false;
                    this.message.success(this.commonService.fanyi('tip.query-fail'));
                }
            );
    }
    doReset() {
        this.usersearchGroup.reset({}); // 重置表单
    }
    /*以下为表格搜索和排序功能 */
    sortName = null;
    sortValue = null;
    sort(sortName, value) {
        this.sortName = sortName;
        this.sortValue = value;
        this.userData = [...this.userData.sort((a, b) => {
            if (a[this.sortName] > b[this.sortName]) {
                return (this.sortValue === 'ascend') ? 1 : -1;
            } else if (a[this.sortName] < b[this.sortName]) {
                return (this.sortValue === 'ascend') ? -1 : 1;
            } else {
                return 0;
            }
        })];
    }
    reset() {
        this._getUserData();
    }
}
