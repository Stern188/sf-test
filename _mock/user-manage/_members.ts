import { HttpRequest } from '@angular/common/http';
import { MockRequest } from '@delon/mock';

const list = [];
const prilist = [];

for (let i = 0; i < 46; i += 1) {
    list.push({
        key: i,
        uname: `姓名 ${i}`,
        rname: `真实姓名 ${i}`,
        map_name: `类型 ${i}`,
        email: `邮箱 ${i}`,
        operate_time: `操作时间 ${i}`,
        comment: `描述 ${i}`
    });
}

for (let i = 0; i < 46; i += 1) {
    prilist.push({
        key: i,
        uname: `姓名 ${i}`,
        rname: `真实姓名 ${i}`,
        map_name: `类型 ${i}`,
        email: `邮箱 ${i}`,
        operate_time: `操作时间 ${i}`,
        comment: `描述 ${i}`
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
    return { msg: ret, success: true };
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
    return { msg: ret, success: true };
}

function removeDatas(key: number): boolean {
    return true;
}

function saveDatas(data: object) {
    data['key'] = list.length;
    list.unshift(data);
    return { msg: list, success: true };
}

function editDatas(data: object) {
    list[0] = data;
    return { msg: list, success: true };
}

export const Members = {
    '/user_manager/user_register': (req: MockRequest) => getRolesDatas(req.queryString),
    // '/user_manager/user_register': (req: MockRequest) => getPrivilegeDatas(req.queryString),
    'DELETE /user_manager/user_register': (req: MockRequest) => removeDatas(req.queryString.key),
    'POST /user_manager/user_register': (req: MockRequest) => saveDatas(req.body),
    'PUT /user_manager/user_register': (req: MockRequest) => editDatas(req.body)
};
