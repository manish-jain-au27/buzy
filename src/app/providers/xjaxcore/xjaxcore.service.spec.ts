import { TestBed, inject } from '@angular/core/testing';

import { XjaxcoreService } from './xjaxcore.service';

describe('XjaxcoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XjaxcoreService]
    });
  });

  it('should be created', inject([XjaxcoreService], (service: XjaxcoreService) => {
    expect(service).toBeTruthy();
  }));
});
