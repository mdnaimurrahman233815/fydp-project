import Link from "next/link";
import { redirect } from "next/navigation";
import { TeacherLoginForm } from "@/components/Forms";
import { Footer, PublicNav } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function TeacherLoginPage() {
  const session = await getSession();
  if (session?.kind === "student") redirect("/student/dashboard");
  if (session?.kind === "teacher") redirect("/teacher/dashboard");

  return (
    <div>
      <PublicNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Staff access</p>
          <h1 className="font-display mt-2 text-4xl text-[#12324d]">Teachers and administrators sign in here.</h1>
          <p className="mt-3 max-w-md text-[#5d564b]">
            Review every group, assign supervisors, and message student teams. Admin accounts can also deactivate groups or remove members.
          </p>
        </div>
        <div className="card p-6">
          <TeacherLoginForm />
          <p className="mt-4 text-sm text-[#6b6256]">
            Student instead?{" "}
            <Link className="font-semibold text-teal-800" href="/login/student">
              Student login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
