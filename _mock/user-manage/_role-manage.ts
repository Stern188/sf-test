import { HttpRequest } from '@angular/common/http';
import { MockRequest } from '@delon/mock';

const list = [];
const prilist = [];

for (let i = 0; i < 46; i += 1) {
    list.push({
        key: i,
        name: `角色 ${i}`,
        operate_time: `操作时间 ${i}`,
        description: `描述 ${i}`
    });
}

for (let i = 0; i < 46; i += 1) {
    prilist.push({
        key: i,
        module_name: `权限 ${i}`,
        module_id: `权限id ${i}`
    });
}

function getRolesDatas(params: any) {
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
    return ret;
}

function getPrivilegeDatas(params: any) {
    let ret = [...prilist];
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
    return ret;
}

function removeDatas(key: number): boolean {
    return true;
}

function saveDatas(data: object) {
    data['key'] = list.length;
    list.unshift(data);
    return list;
}

function editDatas(data: object) {
    list[0] = data;
    return list;
}

export const RoleManage = {
    '/user_manager/user_role': (req: MockRequest) => getRolesDatas(req.queryString),
    '/user_manager/user_role?flag=1': (req: MockRequest) => getPrivilegeDatas(req.queryString),
    'DELETE /user-manage/role-manage': (req: MockRequest) => removeDatas(req.queryString.key),
    'POST /user-manage/role-manage': (req: MockRequest) => saveDatas(req.body),
    'PUT /user-manage/role-manage': (req: MockRequest) => editDatas(req.body)
};
