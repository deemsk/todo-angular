import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Todo, TodosService } from '../../services/todos.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-todo-form',
    imports: [ReactiveFormsModule],
    templateUrl: './todo-form.component.html',
    styleUrl: './todo-form.component.scss',
})
export class TodoFormComponent implements OnChanges {
    @Input() mode: 'create' | 'edit' = 'create';
    @Input() todoData?: Todo;

    constructor(
        private todosService: TodosService,
        private router: Router
    ) {}

    todoForm = new FormGroup({
        title: new FormControl('', { nonNullable: true }),
        description: new FormControl('', { nonNullable: true }),
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['todoData'] && this.mode === 'edit' && this.todoData) {
            // Prefill the form when todoData changes
            this.todoForm.patchValue({
                title: this.todoData.title,
                description: this.todoData.description,
            });
        }
    }

    onSubmit() {
        if (this.todoForm.invalid) {
            return;
        }
        if (this.mode === 'create') {
            // Create
            this.todosService.createTodo(this.todoForm.value).subscribe({
                next: (createdTodo) => {
                    // Navigate to the list view after successful creation
                    this.router.navigate(['/todos']);
                },
                error: (err) => {
                    console.error('Error creating todo:', err);
                },
            });
        } else if (this.todoData) {
            // Update
            const updatedTodo = { ...this.todoData, ...this.todoForm.value };
            this.todosService.updateTodo(updatedTodo).subscribe({
                next: () => {
                    // Navigate to the list view after successful creation
                    this.router.navigate(['/todos']);
                },
                error: (err) => {
                    console.error('Error creating todo:', err);
                },
            });
        }
    }

    onDelete() {
        const id = this.todoData?.id;
        if (id) {
            this.todosService.deleteTodo(id).subscribe({
                next: () => this.router.navigate(['/todos']),
                error: (err) => console.error('Delete failed', err),
            });
        }
    }

    onCancel() {
        this.router.navigate(['/todos']);
    }
}
