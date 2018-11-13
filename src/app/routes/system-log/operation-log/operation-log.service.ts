import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class OperationLogService {
    private initUrl = `/user_manager/logging`;//用来获取用户的接口

    getUsers(pageIndex = 1, pageSize = 10, searchData) {
        let params = new HttpParams()
            .append('page', `${pageIndex}`)
            .append('pageSize', `${pageSize}`)
            /* .append('sortField', sortField)
            .append('sortOrder', sortOrder) */;
        for(let key in searchData){
            params = params.append(key, searchData[key]);
        }
        return this.http.get(`${this.initUrl}`, {
            params: params
        })
    }

    constructor(private http: HttpClient) {}
}