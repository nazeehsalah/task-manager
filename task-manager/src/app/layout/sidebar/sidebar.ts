import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task';
import { TaskFormDialog } from '../../shared/dialogs/task-form-dialog/task-form-dialog';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, MatDialogModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  createTask() {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.createTask(result);
      }
    });
  }
}
