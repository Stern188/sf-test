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

function saveDatas(data: object) {
    data['key'] = list.length;
    list.unshift(data);
    return { msg: list, success: true };
}

function editDatas(data: object) {
    list[0] = data;
    return { msg: list, success: true };
}

export const Projects = {
    '/project-manage/projects': (req: MockRequest) => getDatas(req.queryString),
    'DELETE /project-manage/projects': (req: MockRequest) => removeDatas(req.queryString.key),
    'POST /project-manage/projects': (req: MockRequest) => saveDatas(req.body),
    'PUT /project-manage/projects': (req: MockRequest) => editDatas(req.body)
};
