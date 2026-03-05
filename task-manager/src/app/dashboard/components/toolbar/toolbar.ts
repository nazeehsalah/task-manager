import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-dashboard-toolbar',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class DashboardToolbar {
  statusChange = output<string>();
  statuses = ['all', 'todo', 'in_progress', 'done'];
  onTabChange(index: number) {
    this.statusChange.emit(this.statuses[index]);
  }
}
