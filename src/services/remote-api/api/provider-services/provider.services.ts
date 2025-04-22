import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { http } from '../../http.client'
import type { Page } from '../../models/page'
import type { Provider } from '../../models/provider'
import { defaultPageRequest5 } from '../query-params/client.request.query.param'
import type { ProspectRequestQueryParam } from '../query-params/prospect.request.query.param'

export class ProvidersService {
  readonly COMMAND_CONTEXT = `/provider-command-service/v1/providers`
  readonly QUERY_CONTEXT = `/provider-query-service/v1/providers`
  readonly COMMAND_CONSTEXT = `provider-command-service/v1/providers/create-provider-contract`

  getProviders(pageRequest?: any): Observable<Page<Provider>> {
    return http
      .get<Page<Provider>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map(response => response.data))
  }
  getPendingProviders(pageRequest: any): Observable<Page<Provider>> {
    return http
      .get<Page<Provider>>(`${this.QUERY_CONTEXT}/to-approve`, { params: pageRequest })
      .pipe(map(response => response.data))
  }
  getParentProviders(pageRequest: ProspectRequestQueryParam = defaultPageRequest5): Observable<Page<Provider>> {
    return http
      .get<Page<Provider>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map(response => response.data))
  }
  saveProvider(payload: Provider): Observable<Map<string, any>> {
    return http.post<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload).pipe(map(response => response.data))
  }

  getProviderDetails(providerid: string): Observable<Provider> {
    return http.get<Provider>(`${this.QUERY_CONTEXT}/${providerid}`).pipe(map(response => response.data))
  }

  getProviderAllDetails(payload: any, provider: string): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONSTEXT}/${provider}`, payload)
      .pipe(map(response => response.data))
  }

  editProvider(payload: Provider, providerid: string, step: string): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${providerid}`, payload, { params: { step: step } })
      .pipe(map(response => response.data))
  }

  blacklistProvider(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/blacklist`, payload)
      .pipe(map(response => response.data))
  }
  approveProvider(id: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/approve-provider/${id}`)
      .pipe(map(response => response.data))
  }

  unblacklistProvider(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/unblacklist`, payload)
      .pipe(map(response => response.data))
  }

  categorizeProvider(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/category`, payload)
      .pipe(map(response => response.data))
  }

  getProvidersList(payload?: any): Observable<Map<string, any>> {
    return http
      .get<Map<string, any>>(`${this.QUERY_CONTEXT}/findAllproviderIdAndName`, payload)
      .pipe(map(response => response.data))
  }
}
