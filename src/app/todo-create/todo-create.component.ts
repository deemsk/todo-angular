import { Component } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';

@Component({
    selector: 'app-todo-create',
    imports: [TodoFormComponent],
    templateUrl: './todo-create.component.html',
    styleUrl: './todo-create.component.scss',
})
export class TodoCreateComponent {}
