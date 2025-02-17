# 🚀 TODO App Angular

## 📝 Description
This repository contains a full-stack application for managing to-dos.

## ✅ 2. Functional Requirements
The system should support the following functionalities:

- **To-Do Operations:**  
    - **Create:** Allow users to create a to-do with a title and an optional description.
    - **View:** Provide the ability to view to-dos.
    - **Update/Change:** Enable editing of a to-do’s title and description.
    - **Toggle State:** Allow toggling a to-do between the states “pending” and “completed.”
    - **Delete:** Permit the deletion of to-dos.
- **User Interface:**  
    - **List View:**  
        - Display all to-dos with their titles.
        - Provide a mechanism to toggle the completion state on the list page.
        - Include an edit button that opens a detailed view for a selected to-do.
    - **Detail View:**
        - Show details for a single to-do.
        - Allow editing of the title and/or description.
        - Enable deletion of the to-do.
    - **Creation View:**
        - Offer a way to add new to-do items.

## 🏗️ 3. Non-Functional Requirements
The application is intended to be simple and functional, without additional features like authentication, role-based access control, or internationalization.

- **Back-End:**  
    - Based on Node.js, using TypeScript.
    - Expose endpoints for creating, viewing, updating/toggling, and deleting to-dos.
    - Persist to-do data between application restarts (using either the file system or a database).
- **Front-End:**  
    - Developed with the latest version of Angular using TypeScript.
    - Apply minimal styling using any preferred stylesheet format (SCSS is provided as an example).
    - Utilize the Angular router to manage navigation between views.

## ▶️ 4. How to Run
Follow these steps to set up and run the project:

### 📌 Prerequisites
Ensure you have the following installed:
- 🟢 Node.js (>= 16.x)
- 📦 pnpm
- 🐳 Docker

# Running the Todo App with Docker Compose
The project consists of an Angular client, a Node.js/Express backend API, and a PostgreSQL database for persistent storage.

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed on your system.
- `psql` utility to connect to the PostgreSQL database from the console

## Running the app
- Clone the repository:
```sh
  git clone git@github.com:deemsk/todo-angular.git
  cd todo-angular
```
- From the project root, run:
```bash
docker-compose up --build
```
- Connect to the database to create an initial structure:
```bash
psql -h localhost -p 5432 -U appuser -d app
```
Enter password (password is stored in [this file](https://github.com/deemsk/todo-angular/blob/d29f97c26b39556a0ea88456e4bd83e1716f412a/src/server/db.ts#L8))
- Execute the script:
```sql
\i script/init.sql
```
- Open http://localhost:4200/ in your browser