import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image';
}

@Component({
  selector: 'app-common-table-data',
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatTableModule, MatPaginatorModule, 
    MatFormFieldModule, MatInputModule],
  templateUrl: './common-table-data.component.html',
  styleUrl: './common-table-data.component.scss'
})
export class CommonTableComponent {
 @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() enableInternalFilter = false;
  @Input() rowClickable = false;
  @Input() pageSize = 10;
  @Output() rowClick = new EventEmitter<Record<string, unknown>>();

  filterText = '';
  pageIndex = 0;

  get displayedColumns(): string[] {
    return this.columns.map((column) => column.key);
  }

  get filteredRows(): Record<string, unknown>[] {
    const term = this.filterText.trim().toLowerCase();
    if (!this.enableInternalFilter || !term) return this.rows;
    return this.rows.filter((row) =>
      this.columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(term))
    );
  }

  get visibleRows(): Record<string, unknown>[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  filterChanged(): void {
    this.pageIndex = 0;
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}