import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { vi } from 'vitest';
import { ConfirmDialogData } from '../../../core/models/dialog.model';
import { By } from '@angular/platform-browser';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;
  let mockDialogRef: any;

  const defaultData: ConfirmDialogData = {
    title: 'Delete Confirmation',
    message: 'Are you sure you want to delete this task?',
  };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: defaultData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data.title).toBe('Delete Confirmation');
  });

  it('should display the provided title and message', () => {
    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    const messageElement = fixture.debugElement.query(By.css('p')).nativeElement;
    
    expect(titleElement.textContent.trim()).toBe('Delete Confirmation');
    expect(messageElement.textContent.trim()).toBe('Are you sure you want to delete this task?');
  });

  it('should render default button texts when none provided in data', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelBtn = buttons[0].nativeElement;
    const confirmBtn = buttons[1].nativeElement;

    expect(cancelBtn.textContent.trim()).toBe('Cancel');
    expect(confirmBtn.textContent.trim()).toBe('Confirm');
  });
});

describe('ConfirmDialog Custom Text', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;
  let mockDialogRef: any;

  const customData: ConfirmDialogData = {
    title: 'Warning',
    message: 'Discard changes?',
    confirmText: 'Discard',
    cancelText: 'Go Back'
  };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: customData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render custom button texts when provided', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelBtn = buttons[0].nativeElement;
    const confirmBtn = buttons[1].nativeElement;

    expect(cancelBtn.textContent.trim()).toBe('Go Back');
    expect(confirmBtn.textContent.trim()).toBe('Discard');
  });
});
