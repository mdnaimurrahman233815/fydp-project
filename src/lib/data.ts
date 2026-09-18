import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import {
  groupMembers,
  groups,
  joinRequests,
  messages,
  projects,
  students,
  teachers,
} from "@/db/schema";
import { MAX_GROUP_SIZE, PAGE_SIZE } from "./constants";
import { groupStatus, seatsFor } from "./utils";
import type { StudentSession, TeacherSession } from "./auth";

export type GroupCard = {
  id: number;
  name: string;
  description: string | null;
  leaderStudentId: number;
  leaderName: string | null;
  isActive: boolean;
  projectTitle: string;
  projectDescription: string | null;
  supervisorId: number | null;
  supervisorName: string | null;
  memberCount: number;
  availableSeats: number;
  status: "OPEN" | "FULL" | "INACTIVE";
  createdAt: Date;
};

function mapGroup(row: {
  id: number;
  name: string;
  description: string | null;
  leaderStudentId: number;
  leaderName: string | null;
  isActive: boolean;
  projectTitle: string | null;
  projectDescription: string | null;
  supervisorId: number | null;
  supervisorName: string | null;
  memberCount: number;
  createdAt: Date;
}): GroupCard {
  const memberCount = Number(row.memberCount) || 0;
  return {
    ...row,
    projectTitle: row.projectTitle || "Untitled project",
    memberCount,
    availableSeats: seatsFor(memberCount),
    status: groupStatus(memberCount, row.isActive),
  };
}

export async function listSupervisors() {
  return db.select().from(teachers).orderBy(teachers.fullName);
}

export async function listGroups(filters: {
  q?: string;
  supervisorId?: number;
  openOnly?: boolean;
  page?: number;
}) {
  const page = filters.page ?? 1;
  const conditions = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        like(groups.name, term),
        like(projects.title, term),
        like(teachers.fullName, term),
      ),
    );
  }
  if (filters.supervisorId) {
    conditions.push(eq(projects.supervisorTeacherId, filters.supervisorId));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      leaderStudentId: groups.leaderStudentId,
      leaderName: students.fullName,
      isActive: groups.isActive,
      projectTitle: projects.title,
      projectDescription: projects.description,
      supervisorId: projects.supervisorTeacherId,
      supervisorName: teachers.fullName,
      memberCount: count(groupMembers.id),
      createdAt: groups.createdAt,
    })
    .from(groups)
    .leftJoin(projects, eq(projects.groupId, groups.id))
    .leftJoin(teachers, eq(teachers.id, projects.supervisorTeacherId))
    .leftJoin(students, eq(students.id, groups.leaderStudentId))
    .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
    .where(whereClause)
    .groupBy(
      groups.id,
      groups.name,
      groups.description,
      groups.leaderStudentId,
      students.fullName,
      groups.isActive,
      projects.title,
      projects.description,
      projects.supervisorTeacherId,
      teachers.fullName,
      groups.createdAt,
    )
    .orderBy(groups.id);

  let mapped = rows.map(mapGroup);
  if (filters.openOnly) {
    mapped = mapped.filter((group) => group.status === "OPEN");
  }

  const total = mapped.length;
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: mapped.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getGroupDetail(groupId: number) {
  const [row] = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      leaderStudentId: groups.leaderStudentId,
      leaderName: students.fullName,
      leaderRoll: students.rollNumber,
      isActive: groups.isActive,
      projectId: projects.id,
      projectTitle: projects.title,
      projectDescription: projects.description,
      supervisorId: projects.supervisorTeacherId,
      supervisorName: teachers.fullName,
      supervisorEmail: teachers.email,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .leftJoin(projects, eq(projects.groupId, groups.id))
    .leftJoin(teachers, eq(teachers.id, projects.supervisorTeacherId))
    .leftJoin(students, eq(students.id, groups.leaderStudentId))
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!row) return null;

  const members = await db
    .select({
      id: students.id,
      fullName: students.fullName,
      rollNumber: students.rollNumber,
      email: students.email,
      department: students.department,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(students, eq(students.id, groupMembers.studentId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(groupMembers.joinedAt);

  return {
    ...row,
    projectTitle: row.projectTitle || "Untitled project",
    memberCount: members.length,
    availableSeats: seatsFor(members.length),
    status: groupStatus(members.length, row.isActive),
    members,
  };
}

export async function getStudentMembership(studentId: number) {
  const [row] = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.studentId, studentId))
    .limit(1);
  return row ?? null;
}

export async function getPendingRequest(studentId: number, groupId: number) {
  const [row] = await db
    .select()
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.studentId, studentId),
        eq(joinRequests.groupId, groupId),
        eq(joinRequests.status, "PENDING"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listStudentRequests(studentId: number) {
  return db
    .select({
      id: joinRequests.id,
      status: joinRequests.status,
      note: joinRequests.note,
      createdAt: joinRequests.createdAt,
      updatedAt: joinRequests.updatedAt,
      groupId: groups.id,
      groupName: groups.name,
      projectTitle: projects.title,
    })
    .from(joinRequests)
    .innerJoin(groups, eq(groups.id, joinRequests.groupId))
    .leftJoin(projects, eq(projects.groupId, groups.id))
    .where(eq(joinRequests.studentId, studentId))
    .orderBy(desc(joinRequests.createdAt));
}

export async function listLeaderRequests(groupId: number) {
  return db
    .select({
      id: joinRequests.id,
      status: joinRequests.status,
      note: joinRequests.note,
      createdAt: joinRequests.createdAt,
      studentId: students.id,
      fullName: students.fullName,
      rollNumber: students.rollNumber,
      email: students.email,
      department: students.department,
    })
    .from(joinRequests)
    .innerJoin(students, eq(students.id, joinRequests.studentId))
    .where(eq(joinRequests.groupId, groupId))
    .orderBy(desc(joinRequests.createdAt));
}

export async function countPendingForGroup(groupId: number) {
  const [row] = await db
    .select({ total: count() })
    .from(joinRequests)
    .where(and(eq(joinRequests.groupId, groupId), eq(joinRequests.status, "PENDING")));
  return row?.total ?? 0;
}

export async function countUnread(role: "student" | "teacher", userId: number) {
  const [row] = await db
    .select({ total: count() })
    .from(messages)
    .where(
      and(
        eq(messages.receiverRole, role),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false),
      ),
    );
  return row?.total ?? 0;
}

export async function dashboardStats() {
  const [studentCount] = await db.select({ total: count() }).from(students);
  const [teacherCount] = await db.select({ total: count() }).from(teachers);
  const [groupCount] = await db.select({ total: count() }).from(groups);
  const memberCounts = await db
    .select({
      groupId: groupMembers.groupId,
      total: count(),
    })
    .from(groupMembers)
    .groupBy(groupMembers.groupId);

  const countMap = new Map(memberCounts.map((row) => [row.groupId, Number(row.total)]));
  const allGroups = await db.select({ id: groups.id, isActive: groups.isActive }).from(groups);
  let full = 0;
  let open = 0;
  for (const group of allGroups) {
    const size = countMap.get(group.id) ?? 0;
    if (!group.isActive) continue;
    if (size >= MAX_GROUP_SIZE) full += 1;
    else open += 1;
  }

  const [pending] = await db
    .select({ total: count() })
    .from(joinRequests)
    .where(eq(joinRequests.status, "PENDING"));

  return {
    students: studentCount?.total ?? 0,
    teachers: teacherCount?.total ?? 0,
    groups: groupCount?.total ?? 0,
    fullGroups: full,
    openGroups: open,
    pendingRequests: pending?.total ?? 0,
  };
}

export async function listStudentsPage(q: string | undefined, page: number) {
  const term = q?.trim();
  const whereClause = term
    ? or(like(students.fullName, `%${term}%`), like(students.rollNumber, `%${term}%`), like(students.email, `%${term}%`))
    : undefined;

  const [totalRow] = await db
    .select({ total: count() })
    .from(students)
    .where(whereClause);

  const total = totalRow?.total ?? 0;
  const items = await db
    .select()
    .from(students)
    .where(whereClause)
    .orderBy(students.rollNumber)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const memberships = await db
    .select({
      studentId: groupMembers.studentId,
      groupId: groups.id,
      groupName: groups.name,
      leaderStudentId: groups.leaderStudentId,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId));

  const map = new Map(memberships.map((row) => [row.studentId, row]));

  return {
    total,
    page,
    pageSize: PAGE_SIZE,
    items: items.map((student) => {
      const membership = map.get(student.id);
      return {
        ...student,
        groupId: membership?.groupId ?? null,
        groupName: membership?.groupName ?? null,
        isLeader: membership ? membership.leaderStudentId === student.id : false,
      };
    }),
  };
}

export type Conversation = {
  otherId: number;
  otherRole: "student" | "teacher";
  otherName: string;
  lastMessage: string;
  lastAt: Date;
  unread: number;
};

export async function listConversations(role: "student" | "teacher", userId: number): Promise<Conversation[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderRole, role), eq(messages.senderId, userId)),
        and(eq(messages.receiverRole, role), eq(messages.receiverId, userId)),
      ),
    )
    .orderBy(desc(messages.createdAt));

  const studentRows = await db.select({ id: students.id, fullName: students.fullName }).from(students);
  const teacherRows = await db.select({ id: teachers.id, fullName: teachers.fullName }).from(teachers);
  const studentNames = new Map(studentRows.map((row) => [row.id, row.fullName]));
  const teacherNames = new Map(teacherRows.map((row) => [row.id, row.fullName]));

  const map = new Map<string, Conversation>();
  for (const message of rows) {
    const mineAsSender = message.senderRole === role && message.senderId === userId;
    const otherId = mineAsSender ? message.receiverId : message.senderId;
    const otherRole = (mineAsSender ? message.receiverRole : message.senderRole) as "student" | "teacher";
    const key = `${otherRole}:${otherId}`;
    const existing = map.get(key);
    const unreadInc = !mineAsSender && !message.isRead ? 1 : 0;
    if (!existing) {
      map.set(key, {
        otherId,
        otherRole,
        otherName:
          otherRole === "student"
            ? studentNames.get(otherId) ?? "Student"
            : teacherNames.get(otherId) ?? "Teacher",
        lastMessage: message.content,
        lastAt: message.createdAt,
        unread: unreadInc,
      });
    } else {
      existing.unread += unreadInc;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

export async function listThread(
  role: "student" | "teacher",
  userId: number,
  otherRole: "student" | "teacher",
  otherId: number,
) {
  const rows = await db
    .select()
    .from(messages)
    .where(
      or(
        and(
          eq(messages.senderRole, role),
          eq(messages.senderId, userId),
          eq(messages.receiverRole, otherRole),
          eq(messages.receiverId, otherId),
        ),
        and(
          eq(messages.senderRole, otherRole),
          eq(messages.senderId, otherId),
          eq(messages.receiverRole, role),
          eq(messages.receiverId, userId),
        ),
      ),
    )
    .orderBy(messages.createdAt);

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.senderRole, otherRole),
        eq(messages.senderId, otherId),
        eq(messages.receiverRole, role),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false),
      ),
    );

  return rows;
}

export async function getPersonName(role: "student" | "teacher", id: number) {
  if (role === "student") {
    const [row] = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return row ? { name: row.fullName, extra: row.rollNumber, email: row.email } : null;
  }
  const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  return row ? { name: row.fullName, extra: row.department, email: row.email } : null;
}

export async function messageRecipientsForStudent(user: StudentSession) {
  const teacherList = await db
    .select({ id: teachers.id, fullName: teachers.fullName, department: teachers.department, role: teachers.role })
    .from(teachers)
    .orderBy(teachers.fullName);

  let relatedStudents: { id: number; fullName: string; rollNumber: string }[] = [];
  if (user.groupId) {
    relatedStudents = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        rollNumber: students.rollNumber,
      })
      .from(groupMembers)
      .innerJoin(students, eq(students.id, groupMembers.studentId))
      .where(eq(groupMembers.groupId, user.groupId));

    if (user.isLeader) {
      const applicants = await db
        .select({
          id: students.id,
          fullName: students.fullName,
          rollNumber: students.rollNumber,
        })
        .from(joinRequests)
        .innerJoin(students, eq(students.id, joinRequests.studentId))
        .where(and(eq(joinRequests.groupId, user.groupId), eq(joinRequests.status, "PENDING")));
      const seen = new Set(relatedStudents.map((row) => row.id));
      for (const applicant of applicants) {
        if (!seen.has(applicant.id)) relatedStudents.push(applicant);
      }
    }
  } else {
    const requested = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        rollNumber: students.rollNumber,
      })
      .from(joinRequests)
      .innerJoin(groups, eq(groups.id, joinRequests.groupId))
      .innerJoin(students, eq(students.id, groups.leaderStudentId))
      .where(and(eq(joinRequests.studentId, user.id), eq(joinRequests.status, "PENDING")));
    relatedStudents = requested;
  }

  return {
    teachers: teacherList,
    students: relatedStudents.filter((row) => row.id !== user.id),
  };
}

export async function messageRecipientsForTeacher(_user: TeacherSession) {
  const studentList = await db
    .select({
      id: students.id,
      fullName: students.fullName,
      rollNumber: students.rollNumber,
      department: students.department,
    })
    .from(students)
    .orderBy(students.fullName);

  const teacherList = await db
    .select({
      id: teachers.id,
      fullName: teachers.fullName,
      department: teachers.department,
    })
    .from(teachers)
    .orderBy(teachers.fullName);

  return { students: studentList, teachers: teacherList };
}

export async function studentDashboardData(user: StudentSession) {
  const unread = await countUnread("student", user.id);
  const myRequests = await listStudentRequests(user.id);
  const pendingMine = myRequests.filter((row) => row.status === "PENDING").length;
  let pendingIncoming = 0;
  let group = null;
  if (user.groupId) {
    group = await getGroupDetail(user.groupId);
    if (user.isLeader) pendingIncoming = await countPendingForGroup(user.groupId);
  }
  return { unread, pendingMine, pendingIncoming, group, myRequests: myRequests.slice(0, 5) };
}