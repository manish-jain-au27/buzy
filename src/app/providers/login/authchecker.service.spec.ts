import { TestBed, inject } from '@angular/core/testing';

import { AuthcheckerService } from './authchecker.service';

describe('AuthcheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthcheckerService]
    });
  });

  it('should be created', inject([AuthcheckerService], (service: AuthcheckerService) => {
    expect(service).toBeTruthy();
  }));
});
