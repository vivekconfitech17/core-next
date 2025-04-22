import type { Observable } from "rxjs/";
import { map } from "rxjs/operators";

import type { PageRequest } from "../../fettle-remote-api";
import { http } from "../../http.client";

export class QuotationService {
  readonly QUERY_CONTEXT = `/quotation-query-service/v1/quotations`;
  readonly COMMAND_CONTEXT = `/quotation-command-service/v1/quotations`;
  readonly QUERY_CONTEXT_DOWNLOAD = `/quotation-query-service/v1/quotations/download`;
  getQuoationDetails(
    pageRequest: any
  ): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }
  getPlanInfoDetails(
    pageRequest: any
  ): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }

  // https://shaapi.eo2cloud.com/quotation-query-service/v1/quotations/download/1263191187569741824

  
  getQuoationDownload(
    id: any
  ): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/download/${id}`, {
        responseType: 'blob'})
      .pipe(map((response) => response.data));
  }

  getQuoationByProspect(
    prospectName: string
  ): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/search-by-prospect-name/${prospectName}`)
      .pipe(map((response) => response.data));
  }

  getQuoationDetailsByID(quotaionid: string): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/${quotaionid}`)
      .pipe(map((response) => response.data));
  }
  getQuotationDetailsByPolicy(policyId: string): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/renewal/${policyId}`)
      .pipe(map((response) => response.data));
  }
  saveQuotation(payload: any): Observable<Map<string, any>> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
      .pipe(map((response) => response.data));
  }

  uploadTemplate(payload: any, quotationId: string, pageRequest: any,): Observable<any> {
    const headers = { 'Content-Type': 'multipart/form-data' };

    const config = {
      headers: headers,
      params: pageRequest
    }
    
return http

      // .patch<any>(`${this.COMMAND_CONTEXT}/${quotationId}/members`, payload, { params: pageRequest }, { headers })
      .patch<any>(`${this.COMMAND_CONTEXT}/${quotationId}/members`, payload, config)
      .pipe(map((response) => response.data));
  }

  updateQuotation(pageRequest: PageRequest, payload: any, quotationId: string): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${quotationId}`, payload, { params: pageRequest })
      .pipe(map((response) => response.data));
  }
  
  uploadDiscountAndLoading(payload: any, quotationId: string): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${quotationId}/update-loading-amount`, payload)
      .pipe(map((response) => response.data));
  }
  approveQuotation(quotationId: string, pageRequest: PageRequest): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${quotationId}?action=approve`, {})
      .pipe(map((response) => response.data));
  }
}