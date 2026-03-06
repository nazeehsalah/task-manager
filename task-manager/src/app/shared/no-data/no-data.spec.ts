import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoData } from './no-data';

describe('NoData', () => {
  let component: NoData;
  let fixture: ComponentFixture<NoData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoData],
    }).compileComponents();

    fixture = TestBed.createComponent(NoData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the no-data message in HTML', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const p = compiled.querySelector('.no-data-container p');
    expect(p).toBeTruthy();
    expect(p?.textContent?.trim()).toBe('No data available');
  });
});
