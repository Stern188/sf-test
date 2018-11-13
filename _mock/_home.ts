import { HttpRequest } from '@angular/common/http';
import { MockRequest } from '@delon/mock';

const list = [];
const prilist = [];

for (let i = 0; i < 46; i += 1) {
    list.push({
        id: i,
        uname: `姓名 ${i}`,
        name: `项目 ${i}`,
        version: `版本 ${i}`,
        parent_module: `父模块 ${i}`,
        submodule: `子模块 ${i}`,
        status: `自测通过`,
        assess: `是否通过 ${i}`,
        successrate: `成功自测率 ${i}`,
        operate_time: `操作时间 ${i}`,
        description: `描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述 ${i}`,
    });
}

for (let i = 0; i < 46; i += 1) {
    prilist.push({
        id: i,
        uname: `姓名 ${i}`,
        name: `项目 ${i}`,
        version: `版本 ${i}`,
        parent_module: `父模块 ${i}`,
        submodule: `子模块 ${i}`,
        status: `自测通过`,
        assess: `是否通过 ${i}`,
        successrate: `成功自测率 ${i}`,
        operate_time: `操作时间 ${i}`,
        description: `描述 ${i}`,
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

function saveDatas(data: object) {
    data['key'] = list.length;
    list.unshift(data);
    return { msg: list, success: true };
}

function editDatas(data: object) {
    list[0] = data;
    return { msg: list, success: true };
}

export const Home = {
    '/user_manager/index_info?uname=admin': (req: MockRequest) => getDatas(req.queryString),
    'DELETE /user_manager/index_info': (req: MockRequest) => removeDatas(req.queryString.key),
    'POST /user_manager/index_info': (req: MockRequest) => saveDatas(req.body),
    'PUT /user_manager/index_info': (req: MockRequest) => editDatas(req.body)
};
