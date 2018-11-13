import { HttpRequest } from '@angular/common/http';
import { MockRequest } from '@delon/mock';

const list = [];

for (let i = 0; i < 46; i += 1) {
    list.push({
        key: i,
        name: `项目 ${i}`,
        version: `项目版本 ${i}`,
        operate_time: `2018-03-16 10:25:13`,
        description: `描述 ${i}`
    });
}

function getDatas(params: any) {
    let ret = [...list];
    if (params.sorter) {
        const s = params.sorter.split('_');
        ret = ret.sort((prev, next) => {
            if (s[1] === 'descend') {
                return next[s[0]] - prev[s[0]];
            }
            return prev[s[0]] - next[s[0]];
        });
    }
    if (params.statusList && params.statusList.length > 0) {
        ret = ret.filter(data => params.statusList.indexOf(data.status) > -1);
    }
    if (params.no) {
        ret = ret.filter(data => data.no.indexOf(params.no) > -1);
    }
    return { msg: ret, success: true };
}

function removeDatas(key: number): boolean {
    return true;
}

export const OperateLog = {
    '/user_manager/logging?page=1&pageSize=10': (req: MockRequest) => getDatas(req.queryString),
    'DELETE /user_manager/logging?page=1&pageSize=10': (req: MockRequest) => removeDatas(req.queryString.key)
};
