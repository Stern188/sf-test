import { Injectable, Inject } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from './core/i18n/i18n.service';

@Injectable()
export class CommonService {

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
  }
  fanyi(key: string) {
    return this.i18n.fanyi(key);
  }
}
