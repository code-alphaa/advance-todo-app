# TT | Task Tracker - Mobile (React Native / Offline-First)

A high-performance, **100% offline-first React Native mobile application** designed for Android and iOS phones. Built with Expo, TypeScript, and `@react-native-async-storage/async-storage`, it mirrors the exact Jira-style features, themes, and UI of the web application without requiring any external server or network connection.

---

## 📱 Features

1. **100% Offline Architecture**:
   - Stores all tasks, calendar events, issue sequence counters, notification logs, and user preferences locally in your device's internal storage (`AsyncStorage`).
   - Zero internet or remote backend required—works anywhere in airplane mode.

2. **Jira Issue Tracking**:
   - Auto-generated sequential issue keys (`TODO-1`, `TODO-2`, etc.) with local sequence counter.
   - Statuses: `TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`.
   - Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
   - Issue types: `Task`, `Bug`, `Story`, `Epic`.
   - Subtasks checklist with completion checkboxes and add/delete actions.
   - Logged vs Estimated hours tracking.
   - Custom tags and labels.

3. **Daily Rollover Engine**:
   - Identifies any unfinished tasks from previous days and automatically rolls them over to Today when you tap **Sync Rollover**.
   - Maintains a rollover counter badge (`Rolled x1`, `Rolled x2`) and full audit log of all dates reassigned.

4. **Calendar Events & Notification Reminders**:
   - Schedule calendar events with start & end times, location/link, and custom color presets.
   - Set reminder alert timing: **5 min, 10 min, 15 min, 30 min, or 1 hour before**.
   - In-app reminder engine checks every 10 seconds and displays a floating notification banner from the top with event details and sound chime.
   - Persistent Notification Center accessible from the header bell icon.

5. **4 Interactive Views**:
   - **Today View**: 7-day horizontal date strip, status filter chips, today's calendar events strip, and quick inline task creator.
   - **7-Day Weekly Board**: Horizontally scrolling day columns with task counts, scheduled events, and quick add buttons.
   - **Kanban Status Board**: 4 Jira workflow columns (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`) with day filter selector and quick status advancement.
   - **Month Calendar**: Full-month grid with Today highlighted, month switcher with arrows on start & end, colored event pills, and task list.

6. **Dual Custom Themes**:
   - **Dark Theme**: `#37353E`, `#44444E`, `#715A5A`, `#D3DAD9`
   - **Light Theme**: `#FFFAF3`, `#FFF2DB`, `#FFE5BF`, `#F62440`
   - Smooth instant switching via the top navigation toggle.

---

## 🚀 Running on Your Phone

### Option A: Run on Physical Phone (iOS & Android via Expo Go)

1. Install **Expo Go** from the Apple App Store or Google Play Store on your phone.
2. From the project root, start the mobile development server:
   ```bash
   npm run mobile
   # OR
   cd mobile && npm start
   ```
3. A QR code will appear in your terminal:
   - **iPhone**: Open the default Camera app and scan the QR code, then tap to open in Expo Go.
   - **Android**: Open the Expo Go app, tap "Scan QR Code", and point your camera at the terminal.

### Option B: Run in Simulators / Emulators

- **iOS Simulator** (macOS with Xcode):
  ```bash
  npm run mobile:ios
  ```
- **Android Emulator** (Android Studio):
  ```bash
  npm run mobile:android
  ```

---

## 📂 Project Structure

```
mobile/
├── App.tsx                     # Main mobile shell, layout, and reminder listener
├── app.json                    # App config, bundle identifiers, and branding
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── types/
    │   └── index.ts            # Data models (ITask, IEvent, AppNotification, etc.)
    ├── theme/
    │   └── colors.ts           # Dark & Light palettes matching the web app
    ├── services/
    │   └── storage.ts          # Offline storage engine (AsyncStorage, sequence counter, rollover)
    ├── utils/
    │   └── dateUtils.ts        # Week calculation, formatting, month calendar generator
    └── components/
        ├── Header.tsx          # TT logo, branding, today date, bell badge, theme toggle
        ├── WeekNavigator.tsx   # < Prev, Range, Today, Next >
        ├── StatsBanner.tsx     # Sprint progress bar, Done / In Progress / To Do chips, Rollover sync
        ├── BottomNav.tsx       # Floating rounded-full navigation pill (Today, 7 Days, Kanban, Cal, +)
        ├── TaskCard.tsx        # Jira card with status bar, priority, rollover badge, subtask count
        ├── SingleDayView.tsx   # Day view with date strip, status filter, and quick add
        ├── WeeklyBoardView.tsx # 7-day columns board
        ├── KanbanStatusView.tsx# 4-column Jira Kanban board
        ├── CalendarView.tsx    # Month grid with arrows on ends and today highlight
        ├── CreateTaskModal.tsx # Task creation dialog with date, status, priority, type
        ├── CreateEventModal.tsx# Calendar event dialog with reminder offset & color picker
        ├── TaskDetailModal.tsx # Subtasks checklist, time log, labels, rollover audit
        ├── NotificationModal.tsx# Notification center dialog
        ├── ConfirmModal.tsx    # Confirmation popup dialog
        └── InAppNotificationBanner.tsx # Top reminder alert banner
```
