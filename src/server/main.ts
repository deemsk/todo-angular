import express, { NextFunction, Request, Response } from 'express';
import { pool } from './db.js';

/**
 * Typings
 */
export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string; // ISO string timestamp
    updated_at: string; // ISO string timestamp
}

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Add CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

/**
 * API routes
 */
const API_PREFIX = '/api/v1/todos';

// Create a new todo
app.post(API_PREFIX, async (req: Request, res: Response) => {
    const { title, description = '' } = req.body;

    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO todos (title, description)
             VALUES ($1, $2) RETURNING *`,
            [title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all todos
app.get(API_PREFIX, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM todos ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a specific todo by ID
app.get(`${API_PREFIX}/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);

    try {
        const result = await pool.query('SELECT * FROM todos WHERE id = $1', [
            id,
        ]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a todo's title, description, or completion status
app.put(`${API_PREFIX}/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);
    const {
        title,
        description,
        completed,
        updated_at: clientUpdatedAt,
    } = req.body;

    if (!clientUpdatedAt) {
        res.status(400).json({
            error: 'Updated_at timestamp is required for concurrency control',
        });
        return;
    }

    try {
        const newUpdatedAt = new Date().toISOString();
        const result = await pool.query(
            `UPDATE todos
             SET title = $1,
                 description = $2,
                 completed = $3,
                 updated_at = $4
             WHERE id = $5 AND updated_at = $6
             RETURNING *`,
            [title, description, completed, newUpdatedAt, id, clientUpdatedAt]
        );

        if (result.rowCount === 0) {
            res.status(409).json({
                error: 'Todo has been modified by another user',
            });
            return;
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update todo's arbitrary field
app.patch(`${API_PREFIX}/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);
    const updates = req.body;

    // Check if any updates were provided
    if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
    }

    // Build the dynamic SET clause from the keys in the updates object.
    // We skip the "id" field if it's present.
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const key in updates) {
        if (
            Object.prototype.hasOwnProperty.call(updates, key) &&
            key !== 'id'
        ) {
            setClauses.push(`${key} = $${i}`);
            values.push(updates[key]);
            i++;
        }
    }

    // Always update the updated_at field to the current timestamp.
    setClauses.push(`updated_at = $${i}`);
    values.push(new Date().toISOString());
    i++;

    // Prepare the final query using a parameterized query.
    // The WHERE clause checks the id.
    const query = `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`;
    values.push(id);

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a todo
app.delete(`${API_PREFIX}/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'], 10);

    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1', [
            id,
        ]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        // Return 204 No Content on successful deletion.
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * App
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
