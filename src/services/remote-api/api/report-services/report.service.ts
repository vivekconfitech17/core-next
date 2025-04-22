import type { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";

export class ReportService {
  readonly COMMAND_CONTEXT = `/report-service/v1/reports`;
  // readonly QUERY_CONTEXT = `/policy-query-service/v1/policies`;

  downloadReport(payload: any): Observable<any> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT}?responseType=EXCEL`, payload, {
        responseType: 'blob'
      })
      .pipe(map((response) => response.data));
  }

  // /report-service/v1/reports/types
  getReportList(): Observable<any> {
    return http
      .get<Map<string, any>>(`${this.COMMAND_CONTEXT}/types`)
      .pipe(map((response) => response.data));
  }
}
