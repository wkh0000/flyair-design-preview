import { TestBed } from '@angular/core/testing';

import { FlightService } from './flight.service';
import { describe, beforeEach, it } from 'node:test';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
