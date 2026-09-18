import Link from "next/link";
import { Footer, PublicNav } from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { DEMO_PASSWORD } from "@/lib/constants";
import { dashboardStats } from "@/lib/data";

export default async function LandingPage() {
  const session = await getSession();
  const stats = await dashboardStats();

  return (
    <div>
      <PublicNav />
      <main>
        <section className="relative overflow-hidden">
          <img
            src="https://images.pexels.com/photos/5553724/pexels-photo-5553724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"
            alt="Students collaborating on a campus project"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#12324d]/78" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c4a35a]">University project office</p>
              <h1 className="font-display mt-4 max-w-xl text-4xl leading-tight md:text-6xl">
                One desk for every final year design project.
              </h1>
              <p className="mt-5 max-w-xl text-base text-[#efe7d8] md:text-lg">
                Students form groups, leaders review join requests, and teachers keep an eye on seats, supervisors, and project titles — without scattered spreadsheets.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {session?.kind === "student" ? (
                  <Link className="btn btn-gold" href="/student/dashboard">
                    Open student desk
                  </Link>
                ) : session?.kind === "teacher" ? (
                  <Link className="btn btn-gold" href="/teacher/dashboard">
                    Open staff desk
                  </Link>
                ) : (
                  <>
                    <Link className="btn btn-gold" href="/register">
                      Register as student
                    </Link>
                    <Link className="btn btn-ghost border-white/30 text-white" href="/login/student">
                      Student login
                    </Link>
                    <Link className="btn btn-ghost border-white/30 text-white" href="/login/teacher">
                      Teacher login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="card p-6 text-[#1b2430]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Live office snapshot</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="text-xs text-[#6b6256]">Students</p>
                  <p className="font-display text-3xl text-[#12324d]">{stats.students}</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="text-xs text-[#6b6256]">Groups</p>
                  <p className="font-display text-3xl text-[#12324d]">{stats.groups}</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="text-xs text-[#6b6256]">Open seats</p>
                  <p className="font-display text-3xl text-[#12324d]">{stats.openGroups}</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="text-xs text-[#6b6256]">Full groups</p>
                  <p className="font-display text-3xl text-[#12324d]">{stats.fullGroups}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6b6256]">Maximum 6 members per group. A student can belong to only one group at a time.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3" id="roles">
          {[
            {
              title: "Students",
              text: "Register, browse groups, request a seat, or create a team and become the leader.",
              image: "https://images.pexels.com/photos/16420473/pexels-photo-16420473.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
            },
            {
              title: "Team leaders",
              text: "Accept or reject join requests, keep the roster under 6, and message members or staff.",
              image: "https://images.pexels.com/photos/5553051/pexels-photo-5553051.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
            },
            {
              title: "Teachers / Admin",
              text: "Watch full vs open groups, assign supervisors, edit project titles, and message students.",
              image: "https://images.pexels.com/photos/8199151/pexels-photo-8199151.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
            },
          ].map((card) => (
            <article key={card.title} className="card overflow-hidden">
              <img src={card.image} alt={card.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <h2 className="font-display text-2xl text-[#12324d]">{card.title}</h2>
                <p className="mt-2 text-sm text-[#5d564b]">{card.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 pb-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">How it works</p>
              <h2 className="font-display mt-2 text-3xl text-[#12324d]">From empty seat to full team.</h2>
              <ol className="mt-6 space-y-4 text-sm text-[#5d564b]">
                <li className="card p-4"><strong className="text-[#12324d]">1. Create or join.</strong> A student either starts a group (and becomes leader) or requests to join an OPEN team.</li>
                <li className="card p-4"><strong className="text-[#12324d]">2. Leader decides.</strong> Pending requests are accepted only if seats remain. Capacity is checked again inside a database transaction.</li>
                <li className="card p-4"><strong className="text-[#12324d]">3. Staff oversee.</strong> Teachers assign supervisors, update project titles, and see which groups still need members.</li>
                <li className="card p-4"><strong className="text-[#12324d]">4. Keep talking.</strong> Students, leaders, and teachers message each other from a simple inbox.</li>
              </ol>
            </div>
            <div className="card p-6">
              <h3 className="font-display text-2xl text-[#12324d]">Demo accounts</h3>
              <p className="mt-2 text-sm text-[#5d564b]">Password for every seeded account: <strong>{DEMO_PASSWORD}</strong></p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="font-semibold text-[#12324d]">Student / leader</p>
                  <p>ali.raza@student.edu · Team Alpha leader</p>
                  <p>usman.khalid@student.edu · ungrouped, pending request</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="font-semibold text-[#12324d]">Teacher</p>
                  <p>imran.malik@university.edu</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-4">
                  <p className="font-semibold text-[#12324d]">Admin</p>
                  <p>admin@university.edu</p>
                </div>
              </div>
              <Link className="btn btn-primary mt-5" href="/guide">
                Setup & testing checklist
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
