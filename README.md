# FYDP Hub — Final Year Design Project Management System

Central desk for students, team leaders, and teachers to manage FYDP groups, join requests, project information, and messages.

This implementation uses **Next.js (App Router)**, **PostgreSQL**, and **Drizzle ORM** so it can run in this environment. All required business rules from the FYDP specification are enforced on the server.

## Folder structure

```
src/app/                 Pages, layouts, server actions, API
src/components/          Navbar, forms, shared UI
src/db/                  Drizzle client + schema
src/lib/                 Auth, queries, seed, helpers
sql/schema.sql           PostgreSQL schema
sql/schema.mysql.sql     phpMyAdmin-compatible MySQL variant
public/images/           Logo and brand art
```

## Setup

1. Set `DATABASE_URL` in `.env` (default `postgresql://postgres:postgres@127.0.0.1:5432/app_db`).
2. `npm install`
3. `npx drizzle-kit push`
4. Start the app. If `students` is empty, demo data is seeded automatically.

Passwords are stored with `bcryptjs` (`password_hash` / `password_verify` equivalent). Sessions use HTTP-only cookies and a `sessions` table. A new session token is issued on every login.

## Demo accounts

Password for every seeded user: **`Password123!`**

| Role | Email | Notes |
| --- | --- | --- |
| Admin | admin@university.edu | Deactivate groups, remove members |
| Teacher | imran.malik@university.edu | Supervise Team Alpha |
| Leader | ali.raza@student.edu | Team Alpha (3 members, pending request) |
| Leader | zainab.shah@student.edu | Team Beta |
| Ungrouped | usman.khalid@student.edu | Pending request to Alpha |
| Ungrouped | danish.iqbal@student.edu | Free to join |
| Full group | mehwish.rauf@student.edu | Team Delta 6/6 |

## Business rules

- Maximum **6** members per group (checked again inside a transaction on accept).
- A student belongs to **only one** group (unique index on `group_members.student_id`).
- Join requests only when the group is **OPEN** and the student is ungrouped.
- One **PENDING** request per student per group.
- Accepting a request auto-rejects that student’s other pending requests.
- Group creator is the leader and is inserted into `group_members`.

## Testing checklist

See `/guide` in the running app, or:

1. Register + login as a new student.
2. Filter OPEN groups; Team Delta shows FULL and has no join button.
3. Send / cancel a join request.
4. Leader accepts a request; member count increases and cannot exceed 6.
5. Student already in a group cannot create or join another.
6. Messaging works student ↔ leader, student ↔ teacher, leader ↔ teacher.
7. Teacher updates project title and supervisor.
8. Admin deactivates a group and removes a non-leader member.
9. Visiting `/teacher/*` as a student redirects to the student desk.

## Original PHP/XAMPP note

The specification asked for PHP 8 + MySQL + Bootstrap. This sandbox serves Next.js + PostgreSQL, so the same product is implemented here with Tailwind (Bootstrap-like cards/tables/nav) and Drizzle prepared queries. A MySQL schema is included at `sql/schema.mysql.sql` if you later port the data layer to XAMPP/phpMyAdmin.
