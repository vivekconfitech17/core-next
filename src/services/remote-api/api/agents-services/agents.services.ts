import type { Observable } from "rxjs/";
import { map } from "rxjs/operators";

import { http } from "../../http.client";
import type { Agent } from "../../models/agent";
import type { Page } from "../../models/page";
import { defaultPageRequest4 } from "../query-params/client.request.query.param";
import type { ProspectRequestQueryParam } from "../query-params/prospect.request.query.param";

export class AgentsService {
  readonly COMMAND_CONTEXT = `/agent-command-service/v1/agents`;
  readonly COMMAND_CONTEXT_ROOT = `/agent-command-service/v1/agentsbudget`;
  readonly QUERY_CONTEXT = `/agent-query-service/v1/agents`;
  readonly CREATE_AGENT_COMMISION = `/agent-command-service/v1/agentcommissions`
  readonly GET_AGENT_COMMISION = `/agent-query-service/v1/agentcommissions`

  getAgents(
    pageRequest: any
  ): Observable<Page<Agent>> {
    return http
      .get<Page<Agent>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }
  getParentAgents(
    pageRequest: ProspectRequestQueryParam = defaultPageRequest4
  ): Observable<Page<Agent>> {
    return http
      .get<Page<Agent>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }

  importAgentData(
    pagerqsts: any
  ): Observable<Page<Agent>> {
    return http
      .get<Page<Agent>>(`${this.QUERY_CONTEXT}`, { params: pagerqsts })
      .pipe(map((response) => response.data));
  }


  saveAgent(payload: Agent): Observable<Map<string, any>> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
      .pipe(map((response) => response.data));
  }
  
  saveAgentTarget(payload: Agent): Observable<Map<string, any>> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT_ROOT}`, payload)
      .pipe(map((response) => response.data));
  }

  getAgentDetails(agentid: string): Observable<Agent> {
    return http
      .get<Agent>(`${this.QUERY_CONTEXT}/${agentid}`)
      .pipe(map((response) => response.data));
  }

  editAgent(
    payload: Agent,
    agentid: string,
    step: string
  ): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${agentid}`, payload, { params: { step: step } })
      .pipe(map((response) => response.data));
  }
  approveAgent(
    agentid: string,
  ): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${agentid}/approve`)
      .pipe(map((response) => response.data));
  }
  createAgentCommissions(payload: any): Observable<Map<string, any>> {
    return http
      .post<Map<string, any>>(`${this.CREATE_AGENT_COMMISION}`, payload)
      .pipe(map((response) => response.data));
  }

  getAgentCommissionList(pageRequest: any): Observable<Map<string, any>> {
    return http
      .get<Map<string, any>>(`${this.GET_AGENT_COMMISION}`, {params: pageRequest})
      .pipe(map((response) => response.data));
  }

  getCommissionDetails(agentid: string): Observable<Agent> {
    return http
      .get<Agent>(`${this.GET_AGENT_COMMISION}/${agentid}`)
      .pipe(map((response) => response.data));
  }

}


