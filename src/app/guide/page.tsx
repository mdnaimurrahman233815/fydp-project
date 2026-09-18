import { Footer, PublicNav } from "@/components/Navbar";
import { DEMO_PASSWORD } from "@/lib/constants";

export default function GuidePage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Documentation</p>
        <h1 className="font-display mt-2 text-4xl text-[#12324d]">Setup guide & testing checklist</h1>
        <p className="mt-3 text-[#5d564b]">
          This FYDP Management System runs as a Next.js App Router application with PostgreSQL and Drizzle ORM. All required student, leader, and teacher workflows are implemented.
        </p>

        <section className="card mt-8 space-y-3 p-6 text-sm leading-6">
          <h2 className="font-display text-2xl text-[#12324d]">1. Database schema</h2>
          <p>Tables: <code>students</code>, <code>teachers</code>, <code>groups</code>, <code>group_members</code>, <code>projects</code>, <code>join_requests</code>, <code>messages</code>, <code>sessions</code>, <code>action_logs</code>.</p>
          <ul className="list-disc pl-5">
            <li><code>groups.leader_student_id → students.id</code></li>
            <li><code>group_members</code> unique on student (one group at a time) and on (group, student)</li>
            <li><code>projects.group_id</code> unique (one project per group)</li>
            <li><code>projects.supervisor_teacher_id → teachers.id</code></li>
            <li>Max group size of 6 is enforced in transactions when accepting requests</li>
          </ul>
          <p>Full SQL is in <code>sql/schema.sql</code>. Apply with Drizzle: <code>npx drizzle-kit push</code>.</p>
        </section>

        <section className="card mt-5 space-y-3 p-6 text-sm leading-6">
          <h2 className="font-display text-2xl text-[#12324d]">2. How to run</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Configure <code>DATABASE_URL</code> in <code>.env</code> (default: postgresql://postgres:postgres@127.0.0.1:5432/app_db).</li>
            <li>Install dependencies with <code>npm install</code>.</li>
            <li>Push schema: <code>npx drizzle-kit push</code>.</li>
            <li>Start the app. Demo rows are seeded automatically if the students table is empty.</li>
          </ol>
          <p>Credentials live in server-side env only. Passwords are hashed with <code>bcryptjs</code> (<code>password_hash</code> / <code>password_verify</code> equivalent).</p>
        </section>

        <section className="card mt-5 space-y-3 p-6 text-sm leading-6">
          <h2 className="font-display text-2xl text-[#12324d]">3. Demo logins</h2>
          <p>Password for every seeded account: <strong>{DEMO_PASSWORD}</strong></p>
          <ul className="list-disc pl-5">
            <li>Admin: admin@university.edu</li>
            <li>Teacher: imran.malik@university.edu</li>
            <li>Leader (Alpha, 3 members): ali.raza@student.edu</li>
            <li>Leader (Beta): zainab.shah@student.edu</li>
            <li>Ungrouped with pending request: usman.khalid@student.edu</li>
            <li>Ungrouped free student: danish.iqbal@student.edu</li>
            <li>Full group leader (Delta, 6/6): mehwish.rauf@student.edu</li>
          </ul>
        </section>

        <section className="card mt-5 space-y-3 p-6 text-sm leading-6">
          <h2 className="font-display text-2xl text-[#12324d]">4. Testing checklist</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Register a new student and log in. Password hashing should succeed on the next login.</li>
            <li>Browse groups, filter OPEN only, open Team Delta and confirm the Join button is hidden (FULL).</li>
            <li>As danish.iqbal, request to join Team Gamma. Status page shows PENDING. Cancel it, then request again.</li>
            <li>As usman.khalid, you already have a pending request to Alpha.</li>
            <li>As ali.raza (leader), accept Usman. He becomes a member; seats go to 4/6. His other pending requests would be auto-rejected.</li>
            <li>Try to create a second group while already in one — it is blocked.</li>
            <li>As hira.saeed, request Beta. As zainab.shah, reject it. Status becomes REJECTED.</li>
            <li>Fill a group to 6 and confirm further accepts fail and the group shows FULL.</li>
            <li>Send student ↔ leader, student ↔ teacher, and leader ↔ teacher messages. Unread badges update.</li>
            <li>Teacher assigns a supervisor to Team Gamma and edits the project title.</li>
            <li>Admin deactivates a group; join button disappears. Admin removes a non-leader member.</li>
            <li>Direct URL /teacher/dashboard while logged in as student redirects to the student desk.</li>
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}
