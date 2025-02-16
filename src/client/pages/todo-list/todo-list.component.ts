import { Component, OnInit } from '@angular/core';
import { Todo, TodosService } from '../../services/todos.service';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-todo-list',
    imports: [RouterLink, PageLayoutComponent],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
    todos: Todo[] = [];

    constructor(private todosService: TodosService) {}

    ngOnInit(): void {
        // Load todos on component initialization
        this.todosService.getTodos().subscribe();
        // Subscribe to the store to update the local todos array.
        this.todosService.todos$.subscribe((todos) => (this.todos = todos));
    }

    toggleTodo(id: Todo['id']) {
        this.todosService.toggleTodo(id).subscribe({
            error: (error) => {
                console.error('Error toggling todo:', error);
                // Show an error message in a "toast" or something
            },
        });
    }
}
