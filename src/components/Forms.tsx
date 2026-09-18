"use client";

import { useActionState } from "react";
import { loginStudent, loginTeacher, registerStudent } from "@/app/actions/auth";
import { createGroup, requestToJoin, teacherUpdateProject, updateGroupInfo } from "@/app/actions/groups";
import { sendMessage } from "@/app/actions/messages";
import { updatePassword } from "@/app/actions/profile";
import { DEPARTMENTS } from "@/lib/constants";
import type { ActionState } from "@/lib/utils";
import { Alert, Field } from "./ui";

function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button className="btn btn-primary w-full" disabled={pending} type="submit">
      {pending ? "Please wait..." : label}
    </button>
  );
}

export function StudentLoginForm() {
  const [state, action, pending] = useActionState(loginStudent, null as ActionState);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <Field label="University email">
        <input className="input" name="email" type="email" required placeholder="ali.raza@student.edu" />
      </Field>
      <Field label="Password">
        <input className="input" name="password" type="password" required />
      </Field>
      <SubmitButton label="Sign in as student" pending={pending} />
    </form>
  );
}

export function TeacherLoginForm() {
  const [state, action, pending] = useActionState(loginTeacher, null as ActionState);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <Field label="Staff email">
        <input className="input" name="email" type="email" required placeholder="admin@university.edu" />
      </Field>
      <Field label="Password">
        <input className="input" name="password" type="password" required />
      </Field>
      <SubmitButton label="Sign in as staff" pending={pending} />
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerStudent, null as ActionState);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <Field label="Full name">
        <input className="input" name="fullName" required minLength={3} />
      </Field>
      <Field label="Email">
        <input className="input" name="email" type="email" required />
      </Field>
      <Field label="Roll number">
        <input className="input" name="rollNumber" required placeholder="CS-2026-016" />
      </Field>
      <Field label="Department">
        <select className="select" name="department" required defaultValue="">
          <option value="" disabled>
            Select department
          </option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Password">
        <input className="input" name="password" type="password" required minLength={8} />
      </Field>
      <Field label="Confirm password">
        <input className="input" name="confirmPassword" type="password" required minLength={8} />
      </Field>
      <SubmitButton label="Create student account" pending={pending} />
    </form>
  );
}

export function CreateGroupForm({
  teachers,
}: {
  teachers: { id: number; fullName: string; department: string }[];
}) {
  const [state, action, pending] = useActionState(createGroup, null as ActionState);
  return (
    <form action={action} className="card space-y-4 p-6">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <Field label="Group name">
        <input className="input" name="name" required minLength={3} placeholder="Team Horizon" />
      </Field>
      <Field label="Group description">
        <textarea className="textarea min-h-24" name="description" placeholder="What will this team work on?" />
      </Field>
      <Field label="Project title (optional)">
        <input className="input" name="projectTitle" placeholder="Can be set later" />
      </Field>
      <Field label="Project summary (optional)">
        <textarea className="textarea min-h-24" name="projectDescription" />
      </Field>
      <Field label="Preferred supervisor (optional)">
        <select className="select" name="supervisorId" defaultValue="">
          <option value="">Assign later</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName} · {teacher.department}
            </option>
          ))}
        </select>
      </Field>
      <SubmitButton label="Create group and become leader" pending={pending} />
    </form>
  );
}

export function JoinForm({ groupId }: { groupId: number }) {
  const [state, action, pending] = useActionState(requestToJoin, null as ActionState);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <input type="hidden" name="groupId" value={groupId} />
      <textarea className="textarea min-h-24" name="note" placeholder="Short note to the leader (optional)" />
      <button className="btn btn-teal w-full" disabled={pending} type="submit">
        {pending ? "Sending..." : "Request to join"}
      </button>
    </form>
  );
}

export function LeaderGroupForm({
  name,
  description,
  projectTitle,
  projectDescription,
}: {
  name: string;
  description: string;
  projectTitle: string;
  projectDescription: string;
}) {
  const [state, action, pending] = useActionState(updateGroupInfo, null as ActionState);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      {state?.success ? <Alert type="success">{state.success}</Alert> : null}
      <Field label="Group name">
        <input className="input" name="name" defaultValue={name} required />
      </Field>
      <Field label="Description">
        <textarea className="textarea min-h-24" name="description" defaultValue={description} />
      </Field>
      <Field label="Project title">
        <input className="input" name="projectTitle" defaultValue={projectTitle} />
      </Field>
      <Field label="Project summary">
        <textarea className="textarea min-h-24" name="projectDescription" defaultValue={projectDescription} />
      </Field>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save group info"}
      </button>
    </form>
  );
}

export function TeacherProjectForm({
  groupId,
  title,
  description,
  supervisorId,
  teachers,
}: {
  groupId: number;
  title: string;
  description: string;
  supervisorId: number | null;
  teachers: { id: number; fullName: string }[];
}) {
  const [state, action, pending] = useActionState(teacherUpdateProject, null as ActionState);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      {state?.success ? <Alert type="success">{state.success}</Alert> : null}
      <input type="hidden" name="groupId" value={groupId} />
      <Field label="Project title">
        <input className="input" name="title" defaultValue={title} required />
      </Field>
      <Field label="Project description">
        <textarea className="textarea min-h-24" name="description" defaultValue={description} />
      </Field>
      <Field label="Supervisor">
        <select className="select" name="supervisorId" defaultValue={supervisorId ?? ""}>
          <option value="">Unassigned</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
      </Field>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save project"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, null as ActionState);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      {state?.success ? <Alert type="success">{state.success}</Alert> : null}
      <Field label="Current password">
        <input className="input" type="password" name="currentPassword" required />
      </Field>
      <Field label="New password">
        <input className="input" type="password" name="newPassword" required minLength={8} />
      </Field>
      <Field label="Confirm new password">
        <input className="input" type="password" name="confirmPassword" required minLength={8} />
      </Field>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export function MessageForm({
  receiverRole,
  receiverId,
  returnTo,
}: {
  receiverRole: "student" | "teacher";
  receiverId: number;
  returnTo?: string;
}) {
  const [state, action, pending] = useActionState(sendMessage, null as ActionState);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <input type="hidden" name="receiverRole" value={receiverRole} />
      <input type="hidden" name="receiverId" value={receiverId} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <textarea className="textarea min-h-28" name="content" required placeholder="Write a short message..." />
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

export function ComposeForm({
  students,
  teachers,
  selfId,
  selfRole,
}: {
  students: { id: number; fullName: string; rollNumber?: string }[];
  teachers: { id: number; fullName: string; department?: string }[];
  selfId: number;
  selfRole: "student" | "teacher";
}) {
  const [state, action, pending] = useActionState(sendMessage, null as ActionState);
  const teacherOptions = teachers.filter((row) => !(selfRole === "teacher" && row.id === selfId));
  return (
    <form action={action} className="card space-y-3 p-5">
      {state?.error ? <Alert type="error">{state.error}</Alert> : null}
      <Field label="Recipient">
        <select className="select" name="composeTarget" id="composeTarget" required defaultValue="">
          <option value="" disabled>
            Choose someone
          </option>
          {teacherOptions.length ? (
            <optgroup label="Teachers">
              {teacherOptions.map((row) => (
                <option key={`t-${row.id}`} value={`teacher:${row.id}`}>
                  {row.fullName}
                  {row.department ? ` · ${row.department}` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
          {students.length ? (
            <optgroup label="Students">
              {students.map((row) => (
                <option key={`s-${row.id}`} value={`student:${row.id}`}>
                  {row.fullName}
                  {row.rollNumber ? ` · ${row.rollNumber}` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </Field>
      <Field label="Message">
        <textarea className="textarea min-h-28" name="content" required />
      </Field>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Sending..." : "Start conversation"}
      </button>
    </form>
  );
}
