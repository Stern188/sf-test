import {
  MenuService, _HttpClient, SettingsService
} from '@delon/theme';
import { Component, OnDestroy, Inject, Optional, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { environment } from '@env/environment';
import { StartupService } from '@core/startup/startup.service';
import { HttpHeaders } from '@angular/common/http';
import { ACLService } from '@delon/acl';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [],
})
export class UserLoginComponent implements OnDestroy, OnInit {
  SHA256: any = require('crypto-js/sha256');
  form: FormGroup;
  error = '';
  type = 0;
  loading = false;
  hasCaptcha = 'hide';

  constructor(
    fb: FormBuilder,
    public aclSrv: ACLService,
    private http: _HttpClient,
    private router: Router,
    private menuService: MenuService,
    public msg: NzMessageService,
    private settingService: SettingsService,
    private modalSrv: NzModalService,
    private startupSrv: StartupService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.pattern(`[a-zA-Z0-9\u4E00-\u9FA5_]{2,18}`)]],
      password: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required, UserLoginComponent.captchaValid.bind(this)]],
      remember: [true],
    });
    modalSrv.closeAll();
  }
  ngOnInit() {

  } // 在第一次 ngOnChanges 完成后调用。*
  // region: fields

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }
  get mobile() {
    return this.form.controls.mobile;
  }
  get captcha() {
    return this.form.controls.captcha;
  }

  // endregion
  static captchaValid(control: FormControl) {


  }
  switch(ret: any) {
    this.type = ret.index;
  }

  submit() {
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.password.markAsDirty();
      this.captcha.markAsDirty();
      if (this.userName.invalid || this.password.invalid) return;
      if (this.hasCaptcha !== 'hide' && this.captcha.invalid) return;
    } else {
      this.mobile.markAsDirty();
      this.captcha.markAsDirty();
      if (this.mobile.invalid || this.captcha.invalid) return;
    }
    this.loading = true;
    /* setTimeout(() => {
      this.loading = false;
      if (this.type === 0) {
        if (this.userName.value !== 'admin' || this.password.value !== '888888') {
          this.error = `账户或密码错误`;
          return;
        }
      }

      // 清空路由复用信息
      this.reuseTabService.clear();
      localStorage.setItem('uname', 'admin');
      localStorage.setItem('role', '超级管理员');
      // ACL：设置权限为全量
      this.aclSrv.setFull(false);
      if ('超级管理员' === '超级管理员') {
        this.aclSrv.set({ ability: [1] });
      } else {
        this.aclSrv.set({ ability: [2] });
      }
      this.menuService.resume();
      this.tokenService.set({
        token: '123456789',
        name: this.userName.value,
        email: `cipchk@qq.com`,
        id: 10000,
        time: +new Date
      });
      this.router.navigate(['/index']);
    }, 1000); */
    this.http.post(environment.Login_url,
      {
        uname: this.userName.value,
        password: this.SHA256(this.password.value).toString()
      }, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      })
      .subscribe(
        authResult => {
          if (authResult['success']) {
            this.settingService.setUser({
              'name': this.userName.value,
              'avatar': './assets/tmp/img/avatar.jpg',
              'email': 'cipchk@qq.com'
            });
            localStorage.setItem('uname', this.userName.value);
            localStorage.setItem('role', authResult['map_name']);
            // ACL：设置权限为全量
            this.aclSrv.setFull(false);
            if (authResult['map_name'] === '超级管理员') {
              this.aclSrv.set({ ability: [1] });
            } else if (authResult['map_name'] === '普通管理员') {
              this.aclSrv.set({ ability: [2] });
            } else if (authResult['map_name'] === '项目管理员') {
              this.aclSrv.set({ ability: [3] });
            } else {
              this.aclSrv.set({ ability: [4] });
            }
            this.menuService.resume();
            this.setSession(authResult);
            this.router.navigate(['/index']);
            setInterval(() => {
              this.renewToken(authResult);
            }, (authResult['expires_in'] - 5) * 1000);
          } else {
            this.msg.error('用户名或密码输入错误');
            this.loading = false;
          }
        },
        (err) => {
          this.error = `用户名或密码错误`;
          this.loading = false;
        });
  }
  private setSession(authResult): void {
    this.loading = false;
    // 清空路由复用信息
    this.reuseTabService.clear();
    this.tokenService.set({
      token: authResult['id_token'],
      name: this.userName.value,
      email: ``,
      id: 10000,
      time: authResult['expires_in']
    });
  }
  public renewToken(ret) {
    this.http.post(`${environment.refresh_url}`,
      {}, {
        headers: new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${ret['id_token']}`)
      })
      .subscribe(
        authResult => {
          this.setSession(authResult);
        },
        err => {
          this.error = `刷新token失败`;
        }
      );
  }

  ngOnDestroy(): void {
    // if (this.interval$) clearInterval(this.interval$);
  }
}
