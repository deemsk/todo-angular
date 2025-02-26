import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject,
    catchError,
    Observable,
    of,
    Subject,
    tap,
    throwError,
} from 'rxjs';

export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string; // ISO string timestamp
    updated_at: string; // ISO string timestamp
}

@Injectable({
    providedIn: 'root',
})
export class TodosService {
    // Store the todos in a BehaviorSubject for reactive updates.
    private todosSubject = new BehaviorSubject<Todo[]>([]);
    todos$ = this.todosSubject.asObservable();

    private readonly apiUrl = 'http://localhost:3000/api/v1/todos';

    private toggleTimeouts: Record<Todo['id'], any> = {};
    private toggleSubjects: Record<Todo['id'], Subject<Todo>> = {};

    constructor(private http: HttpClient) {}

    // Utility: sort todos by created_at in descending order (newest first)
    private sortTodos(todos: Todo[]): Todo[] {
        return todos.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );
    }

    // Fetch all todos (paging?)
    getTodos(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.apiUrl).pipe(
            tap((serverTodos) => {
                // Preserve any optimistic todos already in the local store (assumed to have negative IDs)
                const currentTodos = this.todosSubject.getValue();
                const optimisticTodos = currentTodos.filter(
                    (todo) => todo.id < 0
                );
                // Merge server todos with optimistic todos
                const mergedTodos = [...serverTodos, ...optimisticTodos];
                this.todosSubject.next(this.sortTodos(mergedTodos));
            })
        );
    }

    // Fetch single todo
    getTodo(id: Todo['id']): Observable<Todo> {
        return this.http.get<Todo>(`${this.apiUrl}/${id}`).pipe(
            tap((fetchedTodo) => {
                const todos = this.todosSubject.getValue();
                let updatedTodos;
                // If the todo is not already in the local store, add it.
                if (!todos.find((todo) => todo.id === id)) {
                    updatedTodos = [...todos, fetchedTodo];
                } else {
                    // Otherwise, update the existing todo with the latest data.
                    updatedTodos = todos.map((todo) =>
                        todo.id === id ? fetchedTodo : todo
                    );
                }
                this.todosSubject.next(this.sortTodos(updatedTodos));
            })
        );
    }

    // Create a new todo
    createTodo(todo: Partial<Todo>): Observable<Todo> {
        // Generate a temporary ID. Here, we use a negative timestamp to avoid conflict with real IDs
        const tempId = -Date.now();
        const now = new Date().toISOString();

        // Build an optimistic Todo with default values
        const optimisticTodo: Todo = {
            id: tempId,
            title: todo.title || '',
            description: todo.description || '',
            completed: false,
            created_at: now,
            updated_at: now,
        };

        // Update the local store immediately
        const currentTodos = this.todosSubject.getValue();
        this.todosSubject.next(
            this.sortTodos([...currentTodos, optimisticTodo])
        );

        // Make the API call
        return this.http.post<Todo>(this.apiUrl, todo).pipe(
            tap((serverTodo) => {
                // Replace the optimistic todo with the server response
                const updatedTodos = this.todosSubject
                    .getValue()
                    .map((todo) => (todo.id === tempId ? serverTodo : todo));
                this.todosSubject.next(this.sortTodos(updatedTodos));
            }),
            // On error, remove the optimistic todo from the local store
            catchError((err) => {
                const updatedTodos = this.todosSubject
                    .getValue()
                    .filter((todo) => todo.id !== tempId);
                this.todosSubject.next(this.sortTodos(updatedTodos));
                return throwError(() => err);
            })
        );
    }

    // Update an existing todo
    updateTodo(todo: Todo): Observable<Todo> {
        const id = todo.id;
        const todos = this.todosSubject.getValue();
        const currentTodo = todos.find((todo) => todo.id === id);

        if (!currentTodo) {
            return throwError(() => new Error('Todo not found'));
        }

        todo.title = todo.title.trim();
        todo.description = todo.description?.trim();

        // Check if any of the updatable properties have actually changed
        const hasChanged =
            currentTodo.title !== todo.title ||
            currentTodo.description !== todo.description;

        if (!hasChanged) {
            // No change detected, so return the current todo wrapped in an observable.
            return of(todo);
        }

        return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo).pipe(
            tap((updatedTodo) => {
                const todos = this.todosSubject.getValue();
                const index = todos.findIndex(
                    (todo) => todo.id === updatedTodo.id
                );
                if (index !== -1) {
                    todos[index] = updatedTodo;
                    this.todosSubject.next(this.sortTodos([...todos]));
                }
            })
        );
    }

    // Toggles todo state
    toggleTodo(id: Todo['id']): Observable<Todo> {
        const todos = this.todosSubject.getValue();
        const todo = todos.find((todo) => todo.id === id);

        if (!todo) {
            // Return an error observable if the todo is not found
            return throwError(() => new Error(`Todo with id ${id} not found`));
        }

        const updatedTodo: Todo = { ...todo, completed: !todo.completed };
        const updatedTodos = todos.map((todo) =>
            todo.id === id ? updatedTodo : todo
        );

        // Optimistically update the store by emitting the new array
        this.todosSubject.next(this.sortTodos(updatedTodos));

        // If there's no subject for this id yet, create one.
        if (!this.toggleSubjects[id] || this.toggleSubjects[id].closed) {
            this.toggleSubjects[id] = new Subject<Todo>();
        }

        // Clear any existing debounce timer for this todo id
        if (this.toggleTimeouts[id]) {
            clearTimeout(this.toggleTimeouts[id]);
        }

        // Set a new debounce timer
        this.toggleTimeouts[id] = setTimeout(() => {
            this.http
                .patch<Todo>(`${this.apiUrl}/${id}`, {
                    completed: updatedTodo.completed,
                })
                .subscribe({
                    next: (serverUpdatedTodo) => {
                        // Emit the updated todo on the subject and complete it.
                        this.toggleSubjects[id].next(serverUpdatedTodo);
                        this.toggleSubjects[id].complete();
                    },
                    error: (err) => {
                        this.toggleSubjects[id].error(err);
                    },
                });

            delete this.toggleTimeouts[id];
        }, 500);

        return this.toggleSubjects[id].asObservable();
    }

    // Delete an existing todo
    deleteTodo(id: Todo['id']): Observable<void> {
        // Get the current todos from the BehaviorSubject
        const todos = this.todosSubject.getValue();

        // Send DELETE request to the API
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                // Update the local store: remove the deleted todo
                const updatedTodos = todos.filter((todo) => todo.id !== id);
                this.todosSubject.next(this.sortTodos(updatedTodos));
            })
        );
    }
}
