import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'header-user',
  template: `
  <nz-dropdown nzPlacement="bottomRight">
    <div class="item d-flex align-items-center px-sm" nz-dropdown>
      <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{settings.user.name}}
      <i class="anticon anticon-caret-down px-sm h6"></i>
    </div>
    <div nz-menu class="width-sm">
        <div nz-menu-item [routerLink]="['/settings']"><i class="anticon anticon-lock mr-sm"></i>{{ 'settings' | translate }}</div>
        <li nz-menu-divider></li>
        <div nz-menu-item (click)="logout()"><i class="anticon anticon-logout mr-sm"></i>{{ 'logout' | translate }}</div>
    </div>
  </nz-dropdown>
  `,
})
export class HeaderUserComponent {
  constructor(
    public settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) { }

  logout() {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url);
  }
}
