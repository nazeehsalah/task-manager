import { TestBed } from '@angular/core/testing';
import { SearchService } from './search';
import { describe, it, expect, beforeEach } from 'vitest';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial empty search term', () => {
    expect(service.searchTerm()).toBe('');
  });

  it('should update search term', () => {
    service.searchTerm.set('test');
    expect(service.searchTerm()).toBe('test');
  });
});
