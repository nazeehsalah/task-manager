import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCard } from './stat-card';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stat', {
      id: 'stat-001',
      title: 'Mock Stat',
      icon: '📊',
      value: 100,
      change: '+10',
      changeLabel: 'today',
      changeType: 'positive',
      color: '#000'
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
