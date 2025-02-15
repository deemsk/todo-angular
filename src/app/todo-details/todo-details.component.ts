import { Component, OnInit } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { Todo, TodosService } from '../services/todos.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-todo-details',
    imports: [TodoFormComponent],
    templateUrl: './todo-details.component.html',
    styleUrl: './todo-details.component.scss',
})
export class TodoDetailsComponent implements OnInit {
    todo!: Todo;

    constructor(
        private route: ActivatedRoute,
        private todoService: TodosService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.todoService.getTodo(id).subscribe({
            next: (todo) => (this.todo = todo),
            error: (err) => console.error('Todo load failed', err),
        });
    }
}
