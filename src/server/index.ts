import express, { Request, Response } from 'express';
import fs from 'node:fs';

/**
 * Typings
 */
interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}

let todos: Todo[] = [];
const STORAGE_FILE_PATH = './data/todos.json';

/**
 * To keep it simple, I'll be using a json-file as a persistent storage
 */
function loadData() {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
        const data = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
        try {
            todos = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing todos.json:', error);
            todos = [];
        }
    }
}

function saveData() {
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(todos));
}

loadData();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * API routes
 */
const API_PREFIX = '/api/v1/todos';

// Create a new todo
app.post(API_PREFIX, (req: Request, res: Response) => {
    const { title = '', description = '' } = req.body;

    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    const newTodo: Todo = {
        id: Date.now(), // using timestamp as a simple unique ID
        title,
        description,
        completed: false,
    };

    todos.push(newTodo);
    saveData();

    res.status(201).json(newTodo);
});

// Get all todos
app.get(API_PREFIX, (req: Request, res: Response) => {
    res.json(todos);
});

// Get a specific todo by ID
app.get(`${API_PREFIX}/:id`, (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);
    // Full scan might take a long time when a lot of records, but for POC it's okay
    const todo = todos.find(item => item.id === id);

    if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
});

// Update a todo's title, description, or completion status
app.put(`${API_PREFIX}/:id`, (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);
    const { title, description, completed } = req.body;
    const todo = todos.find(item => item.id === id);

    if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
    }

    if (title) {
        todo.title = title;
    }
    if (description !== undefined) {
        todo.description = description;
    }
    if (completed !== undefined) {
        todo.completed = completed;
    }

    saveData();
    res.json(todo);
});

// Delete a todo
app.delete(`${API_PREFIX}/:id`, (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);
    const initialLength = todos.length;
    todos = todos.filter(item => item.id !== id);
    
    if (todos.length === initialLength) {
        res.status(404).json({ error: 'Todo not found' });
        return;
    }

    saveData();
    res.status(204).send();
});

/**
 * App
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
