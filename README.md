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

### ⚙️ Installation
Clone the repository and install dependencies:
```sh
  git clone git@github.com:deemsk/todo-angular.git
  cd todo-angular
  pnpm install
```

### 🚀 Running the Application
Start the development server:
```sh
  pnpm run dev
```
For production mode:
```sh
  pnpm start
```

### 🐳 Running with Docker
```sh
  docker-compose up --build
```

### 🧪 Running Tests
Run unit and integration tests:
```sh
  pnpm test
```
