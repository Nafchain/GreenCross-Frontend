import {
	HttpBackend,
	HttpClient,
	HttpErrorResponse,
	HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
import { HttpResponse } from '@angular/common/http';
interface Endpoints {
	[key: string]: string;
  }
@Injectable()
export class GreencrossService {

	endpoints: Endpoints = {
		testDb: '...',
		login: '...',
		getUserForm: 'user/getUserForm',
		setFormResult: 'setFormResults',
		getUserTest: 'getUserTest'
		// other Properties
	  };
	
	constructor(private http: HttpClient, handler: HttpBackend, private httpbackend: HttpClient) {
		this.httpbackend = new HttpClient(handler);
	}

	get(service: string): Observable<any> {
		const httpHeaders = new HttpHeaders({
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': 'http://localhost:4200', // Especifica el origen permitido
			'Access-Control-Allow-Methods': 'GET', // Método HTTP permitido (GET en este caso)
			'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Encabezados personalizados permitidos
			'Access-Control-Allow-Credentials': 'true' // Permitir cookies
		  });
		
		  return this.http.get(environment.urlback + this.endpoints[service], { headers: httpHeaders }).pipe(
			map((response: any) => {
			  return response;
			})
		  );
	  }
	  
	  getParam(service: string, body: any): Observable<any> {
		return this.http.get(environment.urlback + this.endpoints[service] + body).pipe(
		  map((response: any) => { // Añade la anotación de tipo para 'response'
			return response;
		  })
		);
	  }
	  
	  getBackend(service: string): Observable<any> {
		return this.httpbackend.get(environment.urlback + this.endpoints[service]).pipe(
		  map((response: any) => { // Añade la anotación de tipo para 'response'
			return response;
		  })
		);
	  }


	postBackend(service: string, body: any): Observable<any> {
		let headers = new HttpHeaders({
		  'Content-Type': 'application/json'
		});
		return this.httpbackend
		  .post(environment.urlback + this.endpoints[service], body, {
			headers: headers,
			observe: 'response',
			responseType: 'text'
		  })
		  .pipe(
			map((response: HttpResponse<any>) => { // Añade la anotación de tipo para 'response'
			  return response;
			})
		  );
	  }
	post(service: string, body: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': 'http://localhost:4200', // Especifica el origen permitido
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', // Métodos HTTP permitidos
			'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Encabezados personalizados permitidos
			'Access-Control-Allow-Credentials': 'true' // Permitir cookies
		});
		return this.http
			.post(environment.urlback + this.endpoints[service], body, {
				headers: headers,
				observe: 'response',
				responseType: 'text'
			})
			.pipe(
				map((response: HttpResponse<any>) => { // Añade la anotación de tipo para 'response'
				  return response;
				})
			  );	}

	parseErrorBlob(err: HttpErrorResponse): Observable<any> {
		const reader: FileReader = new FileReader();

		const obs = Observable.create((observer: any) => {
			reader.onloadend = (e) => {
				observer.error(JSON.parse(reader.result as string));
				observer.complete();
			};
		});
		reader.readAsText(err.error);
		return obs;
	}

	
	postPaginado(service: string, param: string, body: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});
		return this.http
			.post(environment.urlback + this.endpoints[service] + param, body, {
				headers: headers,
				observe: 'response',
				responseType: 'text'
			})
			.pipe(
				map((response: HttpResponse<any>) => { // Añade la anotación de tipo para 'response'
				  return response;
				})
			  );
	}

	
}
