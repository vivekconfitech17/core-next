import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { http } from '../../http.client'
import type { Member } from '../../models/member'
import type { Page } from '../../models/page'
import type { PageRequest } from '../../models/page.request'
import { defaultPageRequest } from '../../models/page.request'
import { config } from '../configuration'

export class MemberService {
  readonly COMMAND_CONTEXT = `member-command-service/v1`
  readonly COMMAND_CONTEXT0 = `member-command-service/v1/member-details-configs`
  readonly QUERY_CONTEXT001 = `member-query-service/v1`
  readonly QUERY_CONTEXT1 = `member-query-service/v1/member-configs`
  readonly QUERY_CONTEXT2 = `member-query-service/v1/member-api-configs`
  readonly DOWNLOAD_QUERY = `member-query-service/v1/member-template`
  readonly DOWNLOAD_QUERY_ENDORSEMENT = `member-query-service/v1/endorsement`
  readonly UPLOAD_TEMPLATE = `member-command-service/v1/prospects`
  readonly STATUS_QUERY = `member-query-service/v1/prospects`
  readonly DOWNLOAD_REPORT_QUERY = `member-query-service/v1/prospects/member-process-requests`

  readonly COMMAND_CONTEXT1 = `member-command-service/v1/member-configs`
  readonly QUERY_CONTEXT = `member-query-service/v1/member-details-configs`
  readonly QUERY_CONTEXT3 = `member-query-service/v1/members`
  readonly API_COMMAND_CONTEXT = `member-command-service/v1/member-api-configs`
  readonly API_QUERY_CONTEXT = `member-query-service/v1/member-api-configs`
  readonly DEFAULT_QUERY = `member-query-service/v1`
  readonly GET_MEMBER = `member-query-service/v1/members`
  readonly GET_MEMBER_IMAGE = `member-query-service/v1/members/member-docs-details`
  readonly GET_MEMBER_POLICY = `policy-query-service/v1/policies`
  readonly DOWNLOAD_TEMPLATE_CONTEXT = `member-query-service/v1/member-template/renew`
  readonly MEMBER_DETAIL_QUERY = `member-query-service/v1/members`
  readonly MEMBER_UPLOAD_IMAGE_PROFILE = `member-command-service/v1/member-plan-update/member/doc`
  getMember(pageRequest: any): Observable<Page<Member>> {
    return http.get<Page<Member>>(`${this.GET_MEMBER}`, { params: pageRequest }).pipe(map(response => response.data))
  }
  getMemberImageType(memberID: string, docName: string): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT3}/${memberID}/member-docs/${docName}?attatched=true`, {
        responseType: 'blob'
      })
      .pipe(map(response => response.data))
  }
  getPolicyHistoryMember(id: any): Observable<Page<Member>> {
    return http.get<Page<Member>>(`${this.GET_MEMBER_POLICY}/${id}`).pipe(map(response => response.data))
  }
  getMemberImage(id: any): Observable<Page<Member>> {
    return http.get<Page<Member>>(`${this.GET_MEMBER_IMAGE}/${id}`).pipe(map(response => response.data))
  }
  downloadRenewalTemplate(pageRequest: any): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.DOWNLOAD_TEMPLATE_CONTEXT}`, { params: pageRequest })
      .pipe(map(response => response.data))
  }

  saveMemberConfigs(payload: any): Observable<Map<string, any>> {
    return http.post<Map<string, any>>(`${this.COMMAND_CONTEXT1}`, payload).pipe(map(response => response.data))
  }

  getMemberDetails(pageRequest: PageRequest = { ...defaultPageRequest, size: 100 }): Observable<Page<any>> {
    return http.get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest }).pipe(map(response => response.data))
  }

  getMemberConfiguration(pageRequest: PageRequest = { ...defaultPageRequest, size: 100 }): Observable<Page<any>> {
    return http.get<Page<any>>(`${this.QUERY_CONTEXT1}`, { params: pageRequest }).pipe(map(response => response.data))
  }

  getSourceDetails(sourceId: string): Observable<any> {
    return http.get<any>(`${this.QUERY_CONTEXT2}/${sourceId}`).pipe(map(response => response.data))
  }

  downloadTemplate(payload: any, rows: number, isRenewal: boolean): Observable<any> {
    let url = 'member-query-service/v1/member-template'

    if (isRenewal) {
      url = 'member-query-service/v1/member-template' + '/renewal'
    }

    return http
      .get<any>(url, { responseType: 'blob', params: { apiParameters: payload, rows: Number(rows) } })
      .pipe(map(response => response))
  }

  downloadTemplateEndorsement(payload: any, rows: number, isRenewal: boolean, action: string): Observable<any> {
    return http
      .get<any>(`member-query-service/v1/member-template/endorsement`, {
        responseType: 'blob',
        params: { apiParameters: payload, rows: Number(rows), action: action }
      })
      .pipe(map(response => response))
  }

  downloadReport(processRequestId: any, resource: any): Observable<any> {
    return http
      .get<any>(`${this.DOWNLOAD_REPORT_QUERY}/${processRequestId}`, {
        responseType: 'blob',
        params: { type: 'resource', resource }
      })
      .pipe(map(response => response))
  }

  getProcessStat(processRequestId: any): Observable<any> {
    return http.get<any>(`${this.DOWNLOAD_REPORT_QUERY}/${processRequestId}`).pipe(map(response => response.data))
  }

  uploadTemplate(payload: any, prospectId: any): Observable<any> {
    const headers = { 'Content-Type': 'multipart/form-data' }

    return http
      .post<any>(`${this.UPLOAD_TEMPLATE}/${prospectId}/member-process-requests`, payload, { headers })
      .pipe(map(response => response.data))
  }
  uploadProfile(payload: any, memberId: any): Observable<any> {
    const headers = { 'Content-Type': 'multipart/form-data' }

    return http
      .patch<any>(`${this.MEMBER_UPLOAD_IMAGE_PROFILE}/${memberId}`, payload, { headers })
      .pipe(map(response => response.data))
  }

  getProcessStatus(
    prospectId: any,
    pageRequest: PageRequest = { ...defaultPageRequest, size: 100 }
  ): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.STATUS_QUERY}/${prospectId}/member-process-requests`, { params: pageRequest })
      .pipe(map(response => response.data))
  }

  geAPIList(pageRequest: PageRequest = { ...defaultPageRequest, size: 100 }): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.API_QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map(response => response.data))
  }

  getMemberDetail(pageRequest: PageRequest = { ...defaultPageRequest }): Observable<any> {
    return http.get<any>(`${this.MEMBER_DETAIL_QUERY}`, { params: pageRequest }).pipe(map(response => response.data))
  }

  getMemberBalance(id: any): Observable<Page<Member>> {
    return http.get<Page<Member>>(`${this.GET_MEMBER}/balance?membershipNo=${id}`).pipe(map(response => response.data))
  }

  getMemberQuestionnaire(id: any): Observable<Page<Member>> {
    return http.get<Page<Member>>(`${this.GET_MEMBER}/${id}/questionnaries`).pipe(map(response => response.data))
  }

  savePlanScheme(payload: any, sourceType: string, sourceId: string): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/member-plan-update/${sourceType}/${sourceId}`, payload)
      .pipe(map(response => response.data))
  }

  saveMemberType(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/member-plan-update/member-type-update`, payload)
      .pipe(map(response => response.data))
  }
  getDecsion(id: any): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${config.rootUrl}sha-rule-service/sharules/show-decission/${id}`)
      .pipe(map(response => response.data))
  }

  saveMemberBiometric(payload: any, memberId: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/member-plan-update/${memberId}/biometrics`, payload)
      .pipe(map(response => response.data))
  }

  saveMemberQuestionnair(
    payload: { questionId: number; answer: boolean }[],
    memberId: string | number
  ): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/member-plan-update/questionnarie/${memberId}`, payload)
      .pipe(map(response => response.data))
  }

  getMemberQuestionnair(memberId: string | number): Observable<Map<string, any>> {
    return http
      .get<Map<string, any>>(`${this.QUERY_CONTEXT001}/members/${memberId}/questionnaries`)
      .pipe(map(response => response.data))
  }
}
