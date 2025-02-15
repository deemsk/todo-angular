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
    },
    {
        path: 'todos/create',
        component: TodoCreateComponent,
    },
    {
        path: 'todos/:id',
        component: TodoEditComponent,
    },
];
