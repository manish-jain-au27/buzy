import { TestBed, inject } from '@angular/core/testing';

import { PinsocketService } from './pinsocket.service';

describe('PinsocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PinsocketService]
    });
  });

  it('should be created', inject([PinsocketService], (service: PinsocketService) => {
    expect(service).toBeTruthy();
  }));
});
