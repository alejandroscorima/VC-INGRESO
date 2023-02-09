import { TestBed } from '@angular/core/testing';

import { LudopatiaService } from './ludopatia.service';

describe('LudopatiaService', () => {
  let service: LudopatiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LudopatiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
