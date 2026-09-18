-- Optional MySQL / phpMyAdmin variant of the same FYDP schema.
-- The running application uses PostgreSQL (sql/schema.sql) via Drizzle.

CREATE DATABASE IF NOT EXISTS fydp_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fydp_hub;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  roll_number VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY students_email_unique (email),
  UNIQUE KEY students_roll_unique (roll_number)
);

CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY teachers_email_unique (email)
);

CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  leader_student_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY groups_leader_idx (leader_student_id),
  CONSTRAINT groups_leader_fk FOREIGN KEY (leader_student_id) REFERENCES students(id)
);

CREATE TABLE group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY group_members_unique (group_id, student_id),
  UNIQUE KEY group_members_student_unique (student_id),
  CONSTRAINT group_members_group_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT group_members_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  title VARCHAR(220) NOT NULL DEFAULT '',
  description TEXT,
  supervisor_teacher_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY projects_group_unique (group_id),
  KEY projects_title_idx (title),
  KEY projects_supervisor_idx (supervisor_teacher_id),
  CONSTRAINT projects_group_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT projects_supervisor_fk FOREIGN KEY (supervisor_teacher_id) REFERENCES teachers(id)
);

CREATE TABLE join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY join_requests_group_idx (group_id),
  KEY join_requests_student_idx (student_id),
  CONSTRAINT join_requests_group_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT join_requests_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  receiver_id INT NOT NULL,
  receiver_role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role VARCHAR(20) NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY sessions_token_unique (token)
);

CREATE TABLE action_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action VARCHAR(80) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
