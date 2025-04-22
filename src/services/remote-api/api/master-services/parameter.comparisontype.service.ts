import type { Observable } from "rxjs/";
import { map } from "rxjs/operators";

import { http } from "../../http.client";
import type { Page } from "../../models/page";

export class ParameterComparisonTypeService {

    readonly QUERY_CONTEXT = `master-data-service/v1/parametercomparisontypes`;

    getParameterComparisonTypes(): Observable<Page<any>> {
        return http
            .get<Page<any>>(`${this.QUERY_CONTEXT}`)
            .pipe(map((response) => response.data));
    }
}
