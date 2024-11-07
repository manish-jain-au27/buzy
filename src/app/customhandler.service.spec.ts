import { TestBed, inject } from '@angular/core/testing';

import { CustomhandlerService } from './customhandler.service';

describe('CustomhandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomhandlerService]
    });
  });

  it('should be created', inject([CustomhandlerService], (service: CustomhandlerService) => {
    expect(service).toBeTruthy();
  }));
});
