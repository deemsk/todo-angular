import { Component, OnInit } from '@angular/core';
import { Todo, TodosService } from '../../services/todos.service';
import { ActivatedRoute } from '@angular/router';
import { TodoFormComponent } from '../../components/todo-form/todo-form.component';

@Component({
    selector: 'app-todo-edit',
    imports: [TodoFormComponent],
    templateUrl: './todo-edit.component.html',
    styleUrl: './todo-edit.component.scss',
})
export class TodoEditComponent implements OnInit {
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
