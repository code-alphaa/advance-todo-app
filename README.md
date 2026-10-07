# 🚀 Jira-Style Weekly Todo Planner & Task Rollover App

A modern, animated Jira-inspired Todo & Sprint Management web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Express**, and **MongoDB Atlas (Mongoose)**.

Designed for web browsers and easily adaptable to iOS & Android mobile applications.

---

## 🎨 Dual Theme Palettes

The application includes an animated theme toggle in the top navigation bar with persistent local storage:

### ☀️ Light Theme (Image 1)
- **Background**: `#FFFAF3` (Warm cream)
- **Columns & Board Surfaces**: `#FFF2DB` (Soft parchment)
- **Borders & Dividers**: `#FFE5BF` (Subtle sand)
- **Accent & Primary CTA**: `#F62440` (Vibrant Jira red)

### 🌙 Dark Theme (Image 2)
- **Background**: `#0F3040` (Deep oceanic navy)
- **Columns & Cards**: `#464858` (Slate charcoal)
- **Borders & Dividers**: `#A56F63` (Muted terracotta)
- **Accent & Primary CTA**: `#D99B7F` (Warm clay / peach)

---

## 🌟 Key Features

### 1. Jira Look & Feel with Interactive Drag & Drop
- **Sequential Issue Keys**: Auto-generated ticket keys (`TODO-1`, `TODO-2`, etc.) with issue icons (Story 📗, Task 📘, Bug 🐞, Epic ⚡).
- **Kanban Board View**: 4 columns (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`). Drag cards across columns to update status.
- **Priority Badges**: Urgent 🔥, High ▲, Medium ═, Low ▼.
- **Subtasks & Progress**: Interactive checklists with confetti celebration upon 100% completion.
- **Time Tracking**: Estimate and log hours.
- **Search & Filters**: Instantly filter by text, labels, priority, or day of the week.

### 2. 7-Day Weekly Task Distribution
- Clean columns for **Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday**.
- Navigate across weeks with `< Previous Week`, `Today`, `Next Week >`.
- **Drag between days**: Drag any card to any day of the week to reschedule.

### 3. Automatic Daily Rollover Engine
- **Incomplete tasks move forward**: If a task was assigned to a day and was not completed (`status !== 'DONE'`), it automatically moves to the next day / current date.
- **Rollover Badges & Audit**: Displays `🔄 +1d` rollover tags on cards and stores a complete audit trail of dates in the issue's history.
- **Manual Sync**: Top banner includes a **"Sync Rollover"** button for immediate verification.

### 4. Select a Task & Assign to Any Other Day
- **Drag & Drop**: Simply drag the card into any day column.
- **Card Quick Popover**: Click the card menu to pick any day of the week or a custom date.
- **Issue Detail Modal**: Dedicated "Assigned Day of the Week" selector with 7 weekday buttons and date picker.

### 5. Always Show Date of the Day
- The current date is prominently shown in the top navigation (`Today: Wednesday, Oct 7, 2026`).
- Every column header shows the day name and exact date (e.g., `Monday, Oct 5`, `Wednesday, Oct 7`).
- Today is highlighted with a glowing badge.
- Cards and modals display clear, localized dates.

---

## 🗄️ Database Configuration

Connected to MongoDB Atlas:
```
Cluster: cluster0.kjq7m.mongodb.net
Database: jira_todo_db
```
The application stores tasks and auto-incrementing Jira sequence counters in Mongoose models.

---

## 🖥️ Running the Application

### 1. Start Both Frontend & Backend Concurrently
From the root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:5173` (or `5174`)

### 2. Start Separately
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

### 3. Build for Production
```bash
npm run build
```

---

## 📱 Future Mobile App (iOS / Android) Ready

The responsive UI is tailored with touch-friendly cards, mobile bottom sheets, and responsive column scrolling. To bundle as a native iOS or Android app in the future:

```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Jira Todo" "com.todoapp.jira" --web-dir "dist"
npx cap add ios
npx cap add android
npm run build
npx cap sync
```

---

## 📂 Project Architecture

```
TodoApp/
├── client/                     # Vite + React 19 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, WeeklyBoardView, KanbanStatusView, TaskCard, TaskDetailModal, etc.
│   │   ├── services/api.ts     # Frontend API client
│   │   ├── utils/dateUtils.ts  # 7-day week calculation, date formatting
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── App.tsx             # Main dashboard
│   └── tailwind.config.js      # Custom light & dark color palette configuration
├── server/                     # Express + TypeScript + Mongoose (MongoDB Atlas)
│   ├── src/
│   │   ├── models/             # Task model, Counter sequence model
│   │   ├── routes/taskRoutes.ts# CRUD, status patch, assign-date patch, bulk reorder, seed
│   │   ├── services/           # performAutomaticRollover logic
│   │   ├── db.ts               # Mongoose Atlas connection
│   │   └── index.ts            # Express server entrypoint (Port 5001)
└── package.json                # Unified workspace scripts (concurrently, dev, build)
```
