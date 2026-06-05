import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    RouterModule,
    Breadcrumb,
    CommonModule,
    TagModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  @Input() itemsBread: MenuItem[] | undefined;
}
