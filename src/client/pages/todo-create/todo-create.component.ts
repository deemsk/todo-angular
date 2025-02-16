import { Component } from '@angular/core';
import { TodoFormComponent } from '../../components/todo-form/todo-form.component';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';

@Component({
    selector: 'app-todo-create',
    imports: [PageLayoutComponent, TodoFormComponent],
    templateUrl: './todo-create.component.html',
    styleUrl: './todo-create.component.scss',
})
export class TodoCreateComponent {}
