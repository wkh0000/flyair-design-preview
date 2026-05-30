import { TestBed } from '@angular/core/testing';

import { AdminLoginService } from './admin-login.service';
import { describe, beforeEach, it } from 'node:test';

describe('AdminLoginService', () => {
  let service: AdminLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});