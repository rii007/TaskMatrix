# 🚀 TaskMatrix – Project Management Tool

## 📌 Project Overview

**TaskMatrix** is a modern project management web application inspired by tools like Jira and Asana. It helps software teams efficiently manage tasks, collaborate in real time, and track project progress using a Kanban-based workflow.

The goal of this project is to design a scalable, clean, and user-friendly SaaS product interface that reflects real-world engineering standards.

This repository now includes a working Next.js App Router auth flow powered by Supabase, protected dashboard routing via middleware, and a Zustand store that mirrors the signed-in user's profile on the dashboard.

---

## 🎯 Objective

* Build a professional project management system UI
* Enable structured task tracking using Kanban boards
* Simulate real-world team collaboration workflows
* Demonstrate frontend architecture and UI/UX skills

---

## 👩‍💻 Track

Frontend Developer (React + UI Focus)

---

## 🛠️ Tech Stack

### Frontend

* **Next.js** – React framework for scalable applications
* **Tailwind CSS** – Utility-first styling
* **TypeScript** – Type safety and better maintainability
* **ShadCN UI** – Accessible UI components

### Backend (Planned for Future)

* **Node.js + Express.js**
* **MongoDB**
* **Socket.io** – Real-time updates

### Tools & Platforms

* **Figma** – UI/UX Design
* **Git & GitHub** – Version control

---

## ✨ Core Features

### 🔐 Authentication

* User Sign Up / Login via Supabase Auth
* Protected dashboard route via Next.js middleware
* Signed-in user profile stored in Zustand for dashboard display

### 📋 Kanban Board

* Drag-and-drop task management
* Columns:

  * To Do
  * In Progress
  * Done

### 🧑‍🤝‍🧑 Team Collaboration

* Assign tasks to team members
* Role-based access (Admin / Member)

### ⏰ Task Management

* Add, edit, delete tasks
* Set due dates
* Priority tags (Low, Medium, High)
* Task descriptions

### 🔔 Activity Feed (Planned)

* Real-time updates on task changes
* Notifications system

---

## 🎨 UI/UX Design (Figma)

👉 **Main Design File:**
https://www.figma.com/design/6pp5RK5HQo9r6o2ENaRNi9/Untitled

👉 **Screens:**

* Login Page: https://www.figma.com/design/6pp5RK5HQo9r6o2ENaRNi9/Untitled?node-id=0-1
* Dashboard (Kanban Board): https://www.figma.com/design/6pp5RK5HQo9r6o2ENaRNi9/Untitled?node-id=8-29

---

## 🧠 Design Thinking

The UI is designed with the following principles:

* **Minimal & Clean Layout** – Focus on usability
* **Kanban Workflow** – Intuitive task tracking
* **Dark Theme UI** – Developer-friendly interface
* **Component-Based Design** – Scalable and reusable
* **Clear Visual Hierarchy** – Improves readability and navigation

---

## 📱 Screens Included

### 1. Login Page

* Simple and clean authentication UI
* Focus on accessibility and clarity

### 2. Dashboard (Kanban Board)

* Task columns (To Do, In Progress, Done)
* Card-based task representation
* Designed for drag-and-drop interaction

### 3. Task Management UI

* Task cards with metadata
* Scalable design for future enhancements

---

## 🧩 Project Structure

```
taskmatrix/
│
├── app/             # Next.js App Router pages and global styles
├── components/      # Reusable UI components
├── lib/             # Supabase helpers
├── store/           # Zustand state
└── middleware.ts    # Route protection
```

---

## 🔧 Setup

1. Copy [.env.example](.env.example) to `.env.local`.
2. Fill in your Supabase project URL and anon key.
3. In Supabase Auth settings, disable email confirmation if you want immediate sign-up to log in right away during local testing.
4. Install dependencies and run the app with `npm install` and `npm run dev`.

Core routes:

* [/login](app/login/page.tsx)
* [/register](app/register/page.tsx)
* [/dashboard](app/dashboard/page.tsx)

Protected access is enforced in [middleware.ts](middleware.ts), and the dashboard reads the current user from [store/auth-store.ts](store/auth-store.ts).

---

## 🔄 User Flow

1. User logs in
2. Lands on Dashboard
3. Creates a new task
4. Assigns task to a team member
5. Moves task across Kanban columns
6. Views and updates task details

---

## 🚧 Future Enhancements

* Real-time collaboration (WebSockets)
* File attachments in tasks
* Comments system
* Dark/Light theme toggle
* Analytics dashboard
* Search & filter functionality

---

## 📅 Development Plan

### Week 1

* PRD + Figma Design ✅

### Week 2

* Setup Next.js project
* Build UI components

### Week 3 & 4

* Implement Kanban board functionality


## 📌 Why This Project Matters

This project demonstrates:

* Real-world SaaS product thinking
* Strong UI/UX design fundamentals
* Component-based frontend architecture
* Problem-solving and planning skills


