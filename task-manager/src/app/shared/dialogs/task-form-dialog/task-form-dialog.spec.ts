import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { vi } from 'vitest';
import { TaskFormDialog, TaskDialogData } from './task-form-dialog';
import { TaskService } from '../../../core/services/task';
import { By } from '@angular/platform-browser';

describe('TaskFormDialog', () => {
  let mockDialogRef: any;
  let mockTaskService: any;

  const defaultAssignees = [
    { id: '1', name: 'Alice', avatar: 'A', email: 'alice@test.com' },
    { id: '2', name: 'Bob', avatar: 'B', email: 'bob@test.com' }
  ];

  const setupComponent = async (dialogData: TaskDialogData) => {
    mockDialogRef = { close: vi.fn() };
    mockTaskService = { assignees: defaultAssignees };

    await TestBed.configureTestingModule({
      imports: [TaskFormDialog, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: TaskService, useValue: mockTaskService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskFormDialog);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  };

  describe('Create Mode', () => {
    let component: TaskFormDialog;
    let fixture: ComponentFixture<TaskFormDialog>;

    beforeEach(async () => {
      const result = await setupComponent({});
      fixture = result.fixture;
      component = result.component;
    });

    it('should create in Create mode by default', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(false);
    });

    it('should have an invalid form if fields are empty', () => {
      const form = component.taskForm;
      form.controls['title'].setValue('');
      form.controls['description'].setValue('');
      form.controls['assigneeId'].setValue('');
      expect(form.valid).toBe(false);
    });

    it('should not call close on submit if the form is invalid', () => {
      component.taskForm.controls['title'].setValue('');
      component.onSubmit();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should render correct title internally', () => {
      const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
      expect(titleElement.textContent).toContain('New Task');
    });

    it('should close dialog when cancel is clicked', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close dialog with partial task result on submit', () => {
      const form = component.taskForm;
      form.controls['title'].setValue('Test task title');
      form.controls['description'].setValue('This is a test');
      form.controls['status'].setValue('in_progress');
      form.controls['priority'].setValue('high');
      const dDate = new Date('2026-05-01');
      form.controls['dueDate'].setValue(dDate);
      form.controls['assigneeId'].setValue('1');
      
      expect(form.valid).toBe(true);

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test task title',
        description: 'This is a test',
        status: 'in_progress',
        priority: 'high',
        dueDate: dDate.toISOString().split('T')[0],
        assignee: defaultAssignees[0],
        tags: ['General'],
        isOverdue: false
      }));
    });
  });

  describe('Edit Mode', () => {
    let component: TaskFormDialog;
    let fixture: ComponentFixture<TaskFormDialog>;

    const existingTask: any = {
      id: 'task-1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: 'done',
      priority: 'low',
      dueDate: new Date('2025-01-01').toISOString(),
      assignee: defaultAssignees[1],
      tags: ['Frontend', 'Bug'],
      isOverdue: true
    };

    beforeEach(async () => {
      const result = await setupComponent({ task: existingTask });
      fixture = result.fixture;
      component = result.component;
    });

    it('should create in Edit mode when task data is provided', () => {
      expect(component.isEditMode).toBe(true);
      const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
      expect(titleElement.textContent).toContain('Edit Task');
    });

    it('should populate the form with existing task data', () => {
      const form = component.taskForm;
      expect(form.controls['title'].value).toBe('Existing Task');
      expect(form.controls['description'].value).toBe('Existing Description');
      expect(form.controls['status'].value).toBe('done');
      expect(form.controls['priority'].value).toBe('low');
      expect(form.controls['assigneeId'].value).toBe('2');
      expect(form.controls['dueDate'].value.toISOString()).toContain('2025-01-01');
    });

    it('should preserve existing tags on submit', () => {
      component.taskForm.controls['title'].setValue('Updated Title');
      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Title',
        description: 'Existing Description',
        status: 'done',
        priority: 'low',
        assignee: defaultAssignees[1],
        tags: ['Frontend', 'Bug'],
        isOverdue: false 
      }));
    });
  });

  describe('Template Validation & Interaction', () => {
    let component: TaskFormDialog;
    let fixture: ComponentFixture<TaskFormDialog>;

    beforeEach(async () => {
      const result = await setupComponent({});
      fixture = result.fixture;
      component = result.component;
    });

    it('should disable submit button when form is invalid', () => {
      component.taskForm.controls['title'].setValue('');
      fixture.detectChanges();
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      expect(submitBtn.disabled).toBe(true);
    });

    it('should show error messages when fields are touched and empty', () => {
      const form = component.taskForm;
      
      const titleCtrl = form.controls['title'];
      titleCtrl.setValue('');
      titleCtrl.markAsTouched();

      const descCtrl = form.controls['description'];
      descCtrl.setValue('');
      descCtrl.markAsTouched();

      const dateCtrl = form.controls['dueDate'];
      dateCtrl.setValue(null);
      dateCtrl.markAsTouched();

      const assigneeCtrl = form.controls['assigneeId'];
      assigneeCtrl.setValue('');
      assigneeCtrl.markAsTouched();

      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('mat-error'));
      // Title, Description, Due Date, Assignee
      expect(errorMessages.length).toBeGreaterThanOrEqual(4);
      const textContent = errorMessages.map(e => e.nativeElement.textContent.trim());
      expect(textContent).toContain('Title is required');
      expect(textContent).toContain('Description is required');
      expect(textContent).toContain('Due Date is required');
      expect(textContent).toContain('Assignee is required');
    });

    it('should display "Create" on the submit button in Create mode', () => {
      component.isEditMode = false;
      fixture.detectChanges();
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      expect(submitBtn.textContent.trim()).toBe('Create');
    });

    it('should display "Save" on the submit button in Edit mode', () => {
      component.isEditMode = true;
      fixture.detectChanges();
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      expect(submitBtn.textContent.trim()).toBe('Save');
    });

    it('should display "New Task" as the title in Create mode', () => {
      component.isEditMode = false;
      fixture.detectChanges();
      const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
      expect(titleElement.textContent.trim()).toBe('New Task');
    });

    it('should display "Edit Task" as the title in Edit mode', () => {
      component.isEditMode = true;
      fixture.detectChanges();
      const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
      expect(titleElement.textContent.trim()).toBe('Edit Task');
    });

    it('should enable submit button when form becomes valid', () => {
      // First, it is invalid because it's empty
      component.taskForm.controls['title'].setValue('');
      fixture.detectChanges();
      let submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      expect(submitBtn.disabled).toBe(true);

      // Make valid
      component.taskForm.controls['title'].setValue('Test test title');
      component.taskForm.controls['description'].setValue('Desc');
      component.taskForm.controls['dueDate'].setValue(new Date());
      component.taskForm.controls['assigneeId'].setValue('1');
      fixture.detectChanges();

      submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      expect(submitBtn.disabled).toBe(false);
    });

    it('should render assignee options from *ngFor', async () => {
      // Need to click/open the mat-select to query its options
      const selectElement = fixture.debugElement.query(By.css('mat-select[formControlName="assigneeId"]')).nativeElement;
      selectElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Options are rendered via overlay, so we query document body for mat-option
      const options = document.querySelectorAll('mat-option');
      // We provided 2 defaultAssignees in setup
      expect(options.length).toBeGreaterThanOrEqual(2);
      
      const optionTexts = Array.from(options).map(o => o.textContent?.trim());
      expect(optionTexts).toContain('Alice');
      expect(optionTexts).toContain('Bob');
    });
    it('should correctly handle null form controls to cover HTML optional chaining branches', () => {
      // The HTML has `taskForm.get('title')?.hasError('required')`
      // We need to force `taskForm.get(...)` to return null to hit the false branch of the optional chaining `?.`
      component.taskForm.removeControl('title');
      component.taskForm.removeControl('description');
      component.taskForm.removeControl('dueDate');
      component.taskForm.removeControl('assigneeId');
      
      // Run change detection
      fixture.detectChanges();
      
      // Query error messages to ensure they don't crash and don't show
      const errorMessages = fixture.debugElement.queryAll(By.css('mat-error'));
      // Expect no errors because the controls are completely gone, so hasError is not evaluated to true
      expect(errorMessages.length).toBe(0);
    });

    it('should trigger onCancel function when cancel button is clicked in the DOM', () => {
      vi.spyOn(component, 'onCancel');
      const cancelButton = fixture.debugElement.query(By.css('button[mat-button]')).nativeElement;
      cancelButton.click();
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should trigger onSubmit function when submit button is clicked in the DOM', () => {
      // Must make form valid first so the button is not disabled
      component.taskForm.controls['title'].setValue('Test test title');
      component.taskForm.controls['description'].setValue('Desc');
      component.taskForm.controls['dueDate'].setValue(new Date());
      component.taskForm.controls['assigneeId'].setValue('1');
      fixture.detectChanges();

      vi.spyOn(component, 'onSubmit');
      const submitBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
      submitBtn.click();
      expect(component.onSubmit).toHaveBeenCalled();
    });
  });
});
