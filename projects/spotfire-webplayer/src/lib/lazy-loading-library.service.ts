// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ReplaySubject, Observable } from 'rxjs';

// https://stackoverflow.com/questions/46240293/how-to-lazyload-library-in-angular-4-module
@Injectable({
  providedIn: 'root'
})
export class LazyLoadingLibraryService {
  private loadedLibraries: { [url: string]: ReplaySubject<any> } = {};

  constructor(@Inject(DOCUMENT) private readonly document: any) { }

  public loadJs(url: string): Observable<any> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }

    this.loadedLibraries[url] = new ReplaySubject();

    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => {
      this.loadedLibraries[url].next('');
      this.loadedLibraries[url].complete();
    };
    script.onerror = () => {
      console.error(`Library ${url} is not loaded !`);
      this.loadedLibraries[url].error(`Cannot load Spotfire JS library from ${url}. Check the URL !`);
    };

    this.document.body.appendChild(script);
    return this.loadedLibraries[url].asObservable();
  }
}
