import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import type { Observable } from "rxjs";
import { defer, from } from "rxjs";

import { config } from "./api/configuration";

export class HttpClient {
  private axiosInstance: AxiosInstance;
  constructor(baseUrl?: string) {
    this.axiosInstance = axios.create({ baseURL: baseUrl });

    // this.axiosInstance.defaults.headers

    const requestHandler = (request: any) => {
      // const token: any = (window as any)["getToken"] && (window as any)["getToken"]()

//       if(request.url.slice(0,40) == `${config.rootUrl}sha-rule-service`){
//         const obj = {
//           Accept: "application/json, text/plain, */*"
//         }

//         request.headers = obj;
        
// return request;
//       }

      // if (token) {
      //   request.headers.Authorization = `Bearer ${token}`;
      // }

      
return request;
    };

    const errorHandler = (error: any) => {
      return Promise.reject(error);
    };

    this.axiosInstance.interceptors.request.use(
      (request) => requestHandler(request),
      (error) => errorHandler(error)
    );


    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if(window && window.document){
          const event = new CustomEvent('errorHappend',{
            detail: {
             response:error.response
            }
          });

          window.document.dispatchEvent(event);
        
return Promise.reject(error);
      }
  });

  }

  // private successTransformer(response: AxiosResponse): T {
  //     return response.data;
  // }

  // private errorTransformer(response: AxiosResponse): T {
  //     return response.data;
  // }

  // private errorHandle(): OperatorFunction<any, any> {
  //     return catchError(data => of(this.errorTransformer(data)));
  // }

  // private handleResponse() {
  //     return map(this.successTransformer);
  // }

  

  convertToURLSearchParams(param: any) {
    if (param) {
      const searchParam = new URLSearchParams();

      for (const key in param) {
        const value = param[key];

        if (Array.isArray(value)) {
          value.forEach(item => {
            searchParam.append(key, item);
          })
        } else {
          searchParam.append(key, value);
        }
      }

      
return searchParam;
    }

    
return param;
  }

  get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(this.axiosInstance.get<T, AxiosResponse<T>>(url, config)));
  }

  post<T>(
    url: string,
    body?: any,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(
      this.axiosInstance.post<T, AxiosResponse<T>>(url, body, config)
    ));
  }

  put<T>(
    url: string,
    body?: any,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(this.axiosInstance.put<T, AxiosResponse<T>>(url, body, config)));
  }

  patch<T>(
    url: string,
    body?: any,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(
      this.axiosInstance.patch<T, AxiosResponse<T>>(url, body, config)
    ));
  }
  

  delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(this.axiosInstance.delete<T, AxiosResponse<T>>(url, config)));
  }

  options<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(this.axiosInstance.options<T, AxiosResponse<T>>(url, config)));
  }

  head<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    config = config && {
      ...config,
      params: this.convertToURLSearchParams(config.params)
    };
    
return defer(() => from(this.axiosInstance.head<T, AxiosResponse<T>>(url, config)));
  }
}

export const http = new HttpClient(config.rootUrl);
