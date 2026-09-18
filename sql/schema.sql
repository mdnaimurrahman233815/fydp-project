-- FYDP Hub schema (PostgreSQL / Drizzle)
-- Relationships:
--   groups.leader_student_id -> students.id
--   group_members.group_id -> groups.id
--   group_members.student_id -> students.id  (unique: one group per student)
--   join_requests.group_id -> groups.id
--   join_requests.student_id -> students.id
--   projects.group_id -> groups.id (one-to-one)
--   projects.supervisor_teacher_id -> teachers.id

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  roll_number VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS students_email_unique ON students (email);
CREATE UNIQUE INDEX IF NOT EXISTS students_roll_unique ON students (roll_number);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS teachers_email_unique ON teachers (email);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  leader_student_id INTEGER NOT NULL REFERENCES students(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS groups_leader_idx ON groups (leader_student_id);
CREATE INDEX IF NOT EXISTS groups_name_idx ON groups (name);

CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS group_members_unique ON group_members (group_id, student_id);
CREATE UNIQUE INDEX IF NOT EXISTS group_members_student_unique ON group_members (student_id);
CREATE INDEX IF NOT EXISTS group_members_group_idx ON group_members (group_id);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL DEFAULT '',
  description TEXT,
  supervisor_teacher_id INTEGER REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS projects_group_unique ON projects (group_id);
CREATE INDEX IF NOT EXISTS projects_title_idx ON projects (title);
CREATE INDEX IF NOT EXISTS projects_supervisor_idx ON projects (supervisor_teacher_id);

CREATE TABLE IF NOT EXISTS join_requests (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS join_requests_group_idx ON join_requests (group_id);
CREATE INDEX IF NOT EXISTS join_requests_student_idx ON join_requests (student_id);
CREATE INDEX IF NOT EXISTS join_requests_status_idx ON join_requests (status);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  receiver_id INTEGER NOT NULL,
  receiver_role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages (receiver_role, receiver_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages (sender_role, sender_id);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_unique ON sessions (token);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (role, user_id);

CREATE TABLE IF NOT EXISTS action_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action VARCHAR(80) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
