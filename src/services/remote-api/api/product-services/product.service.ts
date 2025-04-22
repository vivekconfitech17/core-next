import type { AxiosResponse } from "axios";
import type { Observable } from "rxjs/";
import { map } from "rxjs/operators";

import { http } from "../../http.client";
import type { Page } from "../../models/page";
import type { IProduct, IProductBasicDetails, IProductRule } from "../../models/product";

export class ProductService {
  readonly COMMAND_CONTEXT = `/product-command-service/v1/products`;
  readonly QUERY_CONTEXT = `/product-query-service/v1/products`;

  getProducts(
    pageRequest: IProduct
  ): Observable<Page<IProduct>> {
    return http
      .get<Page<IProduct>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }

  saveProductBasicDetails(payload: IProductBasicDetails): Observable<AxiosResponse<Map<string, any>>> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
      .pipe(map((response) => response));
  }


  saveProductRules(productId:string,payload: IProductRule[]): Observable<AxiosResponse<Map<string, any>>> {
    return http
      .put<Map<string, any>>(`${this.COMMAND_CONTEXT}/${productId}/rules`, payload)
      .pipe(map((response) => response));
  }

  getProductDetails(productid: string): Observable<IProduct> {
    return http
      .get<IProduct>(`${this.QUERY_CONTEXT}/${productid}`)
      .pipe(map((response) => response.data));
  }

  /* editProduct(
    payload: IProduct,
    productid: string
  ): Observable<Map<string, any>> {
    return http
      .put<Map<string, any>>(`${this.COMMAND_CONTEXT}/${productid}`, payload)
      .pipe(map((response) => response.data));
  } */

  editProduct(payload: IProduct, productid: string, step: string): Observable<AxiosResponse<Map<string, any>>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${productid}?step=${step}`, payload)
      .pipe(map((response) => response));
  }

  savePremiums(productid: string,payload: any): Observable<AxiosResponse<Map<string, any>>> {
    return http
      .put<Map<string, any>>(`${this.COMMAND_CONTEXT}/${productid}/premiums`, payload)
      .pipe(map((response) => response));
  }

  getPremiums(productid: string): Observable<IProduct> {
    return http
      .get<IProduct>(`${this.QUERY_CONTEXT}/${productid}/premiums`)
      .pipe(map((response) => response.data));
  }
}
