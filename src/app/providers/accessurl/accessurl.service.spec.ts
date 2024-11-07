import { TestBed, inject } from '@angular/core/testing';

import { AccessurlService } from './accessurl.service';

describe('AccessurlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessurlService]
    });
  });

  it('should be created', inject([AccessurlService], (service: AccessurlService) => {
    expect(service).toBeTruthy();
  }));
});
