
import { Component, OnInit, Inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { /* SocialService, SocialOpenType, */ ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import * as moment from 'moment';
import { timezone } from './settings';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
    SHA256: any = require('crypto-js/sha256');
    isAdmin: boolean = localStorage.getItem('uname') === 'admin';
    formGroup: FormGroup; // 密码图表数据
    info: any;
    private passwdUrl = `/user_manager/user_passwd`; // 修改密码的接口
    private memberUrl = `/user_manager/user_register`; // 用来获取用户的接口
    private infoUrl = `/user_manage/sys_time/time_info`; // 用来获取系统信息的接口
    private imgUrl = `/user_manager/user_image`; // 用来保存头像的接口
    active = this.isAdmin ? 5 : 1;
    userForm: FormGroup;
    timeForm: FormGroup;
    timezoneslt = timezone();
    timeSetTypeSlt = [{
        value: 1,
        label: '手动配置'
    }, {
        value: 2,
        label: '本地同步'
    }];
    // Email
    primary_email = 'cipchk@qq.com';
    typeOption: number;
    localTimeOption: string;

    constructor(
        private http: _HttpClient,
        private httpClient: HttpClient,
        public message: NzMessageService,
        private fb: FormBuilder,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    ) {
        this.userForm = fb.group({
            rname: [null, Validators.compose([Validators.required, Validators.pattern(`[\u4E00-\u9FA5]{2,4}`)])],
            uname: [null, Validators.compose([Validators.required, Validators.pattern(`[a-zA-Z0-9\u4E00-\u9FA5_]{2,18}`)])],
            email: [null, Validators.compose([Validators.required, Validators.pattern(/[\w!#$ %& '*+/=?^_`{|}~-]+(?: \.[\w!#$ %& ' * +/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/)])],
            comment: [null, Validators.maxLength(500)]
        });
        this.timeForm = fb.group({
            timezone: [null, [Validators.required]],
            time_set_type: [null, [Validators.required]],
            time: [null, []],
            local_time: [null, []],
            web_time: [null, [Validators.required]]
        });
        this.formGroup = fb.group({
            old_pwd: [null, [Validators.required]],
            new_pwd: [null, [Validators.required]],
            repeat_pwd: [null, [this.repeatPwdValidator]]
        });
    }

    /* 密码更新调用验证 */
    updatePwdValidator() {
        /** wait for refresh value */
        setTimeout(_ => {
            this.formGroup.controls['repeat_pwd'].markAsDirty();
            this.formGroup.controls['repeat_pwd'].updateValueAndValidity();
        });
    }
    imgSrc: any = ['./assets/tmp/img/avatar.jpg'];
    imgflow: any;
    onSelect($event: any, img) {
        this.imgSrc = ['./assets/tmp/img/avatar.jpg'];
        this.imgflow = img;
        switch (typeof ($event)) {
            case 'string':
                this.imgSrc = [$event];
                break;
            case 'object':
                this.imgSrc = $event;
                break;
            default:
        }
    }
    /* repeat_pwd 验证 */
    repeatPwdValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.formGroup.controls['new_pwd']['_pendingValue']) {
            return { a: true, error: true };
        }
    }

    userUpl(event) {
        this.http.put(`${this.memberUrl}`, this.userForm.value).subscribe(res => {
            if (res['success']) {
                this.message.success('提交成功');
            } else {
                this.message.error('提交失败');
            }
        });
    }
    timeSave() {
        if (this.timeForm.value.time_set_type === 1) {
            this.timeForm.value.date = moment(this.timeForm.value.time).format('YYYY-MM-DD HH:mm:ss');
        } else {
            this.timeForm.value.date = this.timeForm.value.local_time;
        }
        this.http.post(`${this.infoUrl}`, this.timeForm.value).subscribe(res => {
            if (res['success']) {
                this.message.success('提交成功');
                this.tokenService.set({
                    token: res['id_token'],
                });
            } else {
                this.message.error('提交失败');
            }
        });
    }

    /* 修改密码 */
    editPassword() {
        for (const i in this.formGroup.controls) {
            this.formGroup.controls[i].markAsDirty();
        }
        if (this.formGroup.valid) {
            const formVal = this.formGroup.value;
            formVal['uname'] = window.localStorage.uname;
            formVal['old_pwd'] = this.SHA256(formVal['old_pwd']).toString();
            formVal['new_pwd'] = this.SHA256(formVal['new_pwd']).toString();
            formVal['repeat_pwd'] = this.SHA256(formVal.repeat_pwd).toString();
            this.http.post(`${this.passwdUrl}`, formVal)
                .subscribe(
                    (data) => {
                        if (data['success']) {
                            this.message.success('提交成功');
                        } else {
                            this.message.error(data['msg']);
                        }
                    },
                    err => {
                        this.message.success('提交失败');
                    }
                );
        }
    }

    ngOnInit() {
        this.typeOption = 1;
        this.localTimeOption = moment().format('YYYY-MM-DD HH:mm:ss');
        const self = this;
        setInterval(function () {
            self.localTimeOption = moment().format('YYYY-MM-DD HH:mm:ss');
        }, 1000);
        if (!this.isAdmin) {
            this._getUserData();
        }
        this._getInfoData();
    }

    /* 获取用户数据 */
    _getUserData() {
        this.http.get(`${this.memberUrl}`).subscribe(res => {
            if (res['success']) {
                this.userForm.patchValue(res['msg'].filter(ret => ret.uname === localStorage.getItem('uname'))[0]);
            } else {
                this.message.error('获取数据失败');
            }
        });
    }

    /* 头像保存方法 */
    _saveImg() {
        this.httpClient.post(`${this.imgUrl}`, { imgSrc: this.imgSrc[0], imgName: this.imgflow.fileName },
            {
                headers: new HttpHeaders().set('Content-Type', 'multipart/form-data')
            }).subscribe(res => {
                if (res['success']) {
                    this.message.error('上传成功');
                } else {
                    this.message.error('上传失败');
                }
            });
    }

    /* 获取系统信息数据 */
    _getInfoData() {
        this.http.get(`${this.infoUrl}`).subscribe(res => {
            this.timeForm.patchValue({
                timezone: res['timezone'],
                time: res['systime'],
                web_time: res['web_time'],
            });
            this.info = res;
        });
    }
}
