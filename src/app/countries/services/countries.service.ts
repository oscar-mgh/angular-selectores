import { Injectable } from '@angular/core';
import {
  Country,
  Region,
  SmallCountry,
} from '../interfaces/countries.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [
    Region.Africa,
    Region.America,
    Region.Europa,
    Region.Oceania,
    Region.Asia,
  ];

  constructor(private http: HttpClient) {}

  get regions(): Region[] {
    return { ...this._regions };
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url: string = `${this.baseUrl}/region/${region}?fields=name,cca3,borders`;
    return this.http.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  getCountriesByAlphaCode(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
    const countryReq: Observable<SmallCountry>[] = [];

    borders.forEach((code) => {
      const request = this.getCountryByAlphaCode(code);
      countryReq.push(request);
    });

    return combineLatest(countryReq);
  }
}
