import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class TodosService {
    // Store the todos in a BehaviorSubject for reactive updates.
    private todosSubject = new BehaviorSubject<Todo[]>([]);
    todos$ = this.todosSubject.asObservable();

    private readonly apiUrl = 'http://localhost:3000/api/v1/todos';

    constructor(private http: HttpClient) {}

    // Fetch all todos (paging?)
    getTodos(): Observable<Todo[]> {
        return this.http.get<Todo[]>(this.apiUrl).pipe(
            tap((todos) => {
                this.todosSubject.next(todos);
            })
        );
    }

    // Fetch single todo
    getTodo(id: Todo['id']): Observable<Todo> {
        return this.http.get<Todo>(`${this.apiUrl}/${id}`);
    }

    // Create a new todo
    createTodo(todo: Partial<Todo>): Observable<Todo> {
        return this.http.post<Todo>(this.apiUrl, todo).pipe(
            tap((newTodo) => {
                const todos = this.todosSubject.getValue();
                this.todosSubject.next([...todos, newTodo]);
            })
        );
    }

    // Update an existing todo
    updateTodo(todo: Todo): Observable<Todo> {
        const id = todo.id;
        return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo).pipe(
            tap((updatedTodo) => {
                const todos = this.todosSubject.getValue();
                const index = todos.findIndex(
                    (todo) => todo.id === updatedTodo.id
                );
                if (index !== -1) {
                    todos[index] = updatedTodo;
                    this.todosSubject.next([...todos]);
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

        // Optimistically update the store by emitting the new array
        const updatedTodos = todos.map((todo) =>
            todo.id === id ? updatedTodo : todo
        );
        this.todosSubject.next(updatedTodos);

        return this.http
            .patch<Todo>(`${this.apiUrl}/${id}`, {
                completed: updatedTodo.completed,
            })
            .pipe(
                catchError((error) => {
                    // If the update fails, revert the store to its previous state
                    this.todosSubject.next(todos);
                    return throwError(() => error);
                })
            );
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
                this.todosSubject.next(updatedTodos);
            })
        );
    }
}
