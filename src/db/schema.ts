import {
  boolean,
  index,
  int,
  mysqlTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
};

export const students = mysqlTable(
  "students",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    rollNumber: varchar("roll_number", { length: 40 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    department: varchar("department", { length: 120 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("students_email_unique").on(table.email),
    rollIdx: uniqueIndex("students_roll_unique").on(table.rollNumber),
  })
);

export const teachers = mysqlTable(
  "teachers",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    department: varchar("department", { length: 120 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("teacher"),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("teachers_email_unique").on(table.email),
  })
);

export const groups = mysqlTable(
  "groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    leaderStudentId: int("leader_student_id")
      .notNull()
      .references(() => students.id),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    leaderIdx: index("groups_leader_idx").on(table.leaderStudentId),
    nameIdx: index("groups_name_idx").on(table.name),
  })
);

export const groupMembers = mysqlTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupId: int("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    studentId: int("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueMember: uniqueIndex("group_members_unique").on(table.groupId, table.studentId),
    uniqueStudent: uniqueIndex("group_members_student_unique").on(table.studentId),
    groupIdx: index("group_members_group_idx").on(table.groupId),
  })
);

export const projects = mysqlTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    groupId: int("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 220 }).notNull().default(""),
    description: text("description"),
    supervisorTeacherId: int("supervisor_teacher_id").references(() => teachers.id),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    groupUnique: uniqueIndex("projects_group_unique").on(table.groupId),
    titleIdx: index("projects_title_idx").on(table.title),
    supervisorIdx: index("projects_supervisor_idx").on(table.supervisorTeacherId),
  })
);

export const joinRequests = mysqlTable(
  "join_requests",
  {
    id: serial("id").primaryKey(),
    groupId: int("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    studentId: int("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    groupIdx: index("join_requests_group_idx").on(table.groupId),
    studentIdx: index("join_requests_student_idx").on(table.studentId),
    statusIdx: index("join_requests_status_idx").on(table.status),
  })
);

export const messages = mysqlTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    senderId: int("sender_id").notNull(),
    senderRole: varchar("sender_role", { length: 20 }).notNull(),
    receiverId: int("receiver_id").notNull(),
    receiverRole: varchar("receiver_role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    receiverIdx: index("messages_receiver_idx").on(table.receiverRole, table.receiverId),
    senderIdx: index("messages_sender_idx").on(table.senderRole, table.senderId),
  })
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    token: varchar("token", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => ({
    tokenIdx: uniqueIndex("sessions_token_unique").on(table.token),
    userIdx: index("sessions_user_idx").on(table.role, table.userId),
  })
);

export const actionLogs = mysqlTable("action_logs", {
  id: serial("id").primaryKey(),
  actorId: int("actor_id").notNull(),
  actorRole: varchar("actor_role", { length: 20 }).notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  details: text("details"),
  ...timestamps,
});

export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type JoinRequest = typeof joinRequests.$inferSelect;
export type Message = typeof messages.$inferSelect;