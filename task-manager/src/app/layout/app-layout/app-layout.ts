import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sidebar } from '../sidebar/sidebar';
import { SearchService } from '../../core/services/search';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, FormsModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, Sidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  searchService = inject(SearchService);
}
