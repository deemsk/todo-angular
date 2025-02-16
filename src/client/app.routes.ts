import { Routes } from '@angular/router';
import { TodoListComponent } from './pages/todo-list/todo-list.component';
import { TodoEditComponent } from './pages/todo-edit/todo-edit.component';
import { TodoCreateComponent } from './pages/todo-create/todo-create.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'todos',
        pathMatch: 'full',
    },
    {
        path: 'todos',
        component: TodoListComponent,
        data: { title: 'Todos' },
    },
    {
        path: 'todos/create',
        component: TodoCreateComponent,
        data: { title: 'Create new todo' },
    },
    {
        path: 'todos/:id',
        component: TodoEditComponent,
        data: { title: 'Edit todo' }
    },
];
