import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import 'assets/gVerify/gVerify.js';

declare let GVerify: any;
@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class UserRegisterComponent implements OnDestroy, OnInit {
  private headers = new Headers({ 'Content-Type': 'application/json' });
  SHA256: any = require('crypto-js/sha256');
  initUrl = '/user_manager/index_register';
  formGroup: FormGroup;
  error = '';
  type = 0;
  loading = false;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception',
  };
  verifyCode: any; // 动态验证码

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public message: NzMessageService,
    private http: _HttpClient,
    private httpClient: HttpClient,
  ) {
    this.formGroup = fb.group({
      uname: [null, Validators.compose([Validators.required, Validators.pattern(`[a-zA-Z0-9\u4E00-\u9FA5_]{2,18}`)])],
      pwd: [null, [Validators.required, Validators.minLength(6), UserRegisterComponent.checkPassword.bind(this)]],
      repeat_pwd: [null, [Validators.minLength(6), UserRegisterComponent.passwordEquar]],
      email: [null, Validators.compose([Validators.required, Validators.pattern(/[\w!#$ %& '*+/=?^_`{|}~-]+(?: \.[\w!#$ %& ' * +/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/)])],
      // mobilePrefix: [ '+86' ],
      // mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required, UserRegisterComponent.captchaValid.bind(this)]]
    });
  }
  /* ngOnChanges(){
      console.log(document.getElementById('captcha'))
  } //- 在输入属性 (input)/输出属性 (output)的绑定值发生变化时调用。 */

  ngOnInit() {
    // this.verifyCode = new GVerify('verifyCode'); 
    this.verifyCode = new GVerify({ // 默认options参数值  
      id: 'verifyCode', // 容器Id  
      canvasId: 'verifyCanvas', // canvas的ID  
      width: '110', // 默认canvas宽度  无效
      height: '30', // 默认canvas高度  无效
      type: 'blend', // 图形验证码默认类型blend:数字字母混合类型、number:纯数字、letter:纯字母  
      code: ''
    });
  } // - 在第一次 ngOnChanges 完成后调用。*


  static checkPassword(control: FormControl) {
    if (!control) return null;
    const self: any = this;
    self.visible = !!control.value;
    if (control.value && control.value.length > 9) self.status = 'ok';
    else if (control.value && control.value.length > 5) self.status = 'pass';
    else self.status = 'pool';

    if (self.visible)
      self.progress =
        control.value.length * 10 > 100 ? 100 : control.value.length * 10;
  }

  static passwordEquar(control: FormControl) {
    if (!control || !control.parent) return null;
    if (!control.value) {
      return { required: true };
    } else if (control.value !== control.parent.get('pwd')['_pendingValue']) {
      return { equar: true };
    }
    // return null;
  }

  static captchaValid(control: FormControl) {
    const self: any = this;
    // self.visible = !!control.value;
    if (!control || !control.parent) return null;
    if (control.value && (control.value.toLowerCase() !== self.verifyCode.options.code.toLowerCase())) {
      return { captcha: true };
    }
    // if (control.value && !self.verifyCode.validate(control.value)) {
    //     return { captcha: true };
    // }

    // return null;

  }

  // region: fields

  get uname() { return this.formGroup.controls.uname; }
  get pwd() { return this.formGroup.controls.pwd; }
  get repeat_pwd() { return this.formGroup.controls.repeat_pwd; }
  // get mobile() { return this.formGroup.controls.mobile; }
  get captcha() { return this.formGroup.controls.captcha; }

  // endregion

  /* 添加用户--密码更新调用验证 */
  updatePwdValidator(a) {
    /** wait for refresh value */
    setTimeout(_ => {
      this.formGroup.controls['repeat_pwd'].markAsDirty();
      this.formGroup.controls['repeat_pwd'].updateValueAndValidity();
    });
  }

  // region: get captcha

  count = 0;
  interval$: any;

  /* 验证码计时 */
  getCaptcha() {
    // this.verificationCode = '123';
    // setTimeout(_ => {
    //     this.formGroup.controls['captcha'].markAsDirty();
    //     this.formGroup.controls['captcha'].updateValueAndValidity();
    // });
    // this.count = 59;
    // this.interval$ = setInterval(() => {
    //     this.count -= 1;
    //     if (this.count <= 0)
    //         clearInterval(this.interval$);
    // }, 1000);
  }

  // endregion

  /* 提交 */
  submit() {
    this.error = '';
    for (const i in this.formGroup.controls) {
      this.formGroup.controls[i].markAsDirty();
    }
    if (this.formGroup.valid) {
      // mock http
      this.loading = true;
      const data = this.formGroup.value;
      data['map_name'] = '普通管理员';
      data['pwd'] = this.SHA256(data.pwd).toString();
      data.repeat_pwd = this.SHA256(data.repeat_pwd).toString();

      this.httpClient.post(`${this.initUrl}`, data, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(
        (res: any) => {
          if (res['success']) {
            localStorage.setItem('registerName', data['uname']);
            this.router.navigate(['/passport/register-result']);
          } else {
            this.message.error(res.msg);
          }
          this.loading = false;
        },
        err => {
          this.loading = false;
          this.message.error('注册失败');
        }
      );
    }

  }

  /* 本组件销毁前执行 */
  ngOnDestroy(): void {
    if (this.interval$) clearInterval(this.interval$);
  }
}
