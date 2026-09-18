import Link from "next/link";
import { StudentLoginForm } from "@/components/Forms";
import { Footer, PublicNav } from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentLoginPage() {
  const session = await getSession();
  if (session?.kind === "student") redirect("/student/dashboard");
  if (session?.kind === "teacher") redirect("/teacher/dashboard");

  return (
    <div>
      <PublicNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">Student access</p>
          <h1 className="font-display mt-2 text-4xl text-[#12324d]">Sign in to your project desk.</h1>
          <p className="mt-3 max-w-md text-[#5d564b]">
            Browse groups, send join requests, or manage the team you created. Use a seeded demo account or register a new student.
          </p>
          <img
            src="https://images.pexels.com/photos/5554244/pexels-photo-5554244.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000"
            alt="Students working together"
            className="mt-6 hidden h-72 w-full rounded-[1.5rem] object-cover lg:block"
          />
        </div>
        <div className="card p-6">
          <StudentLoginForm />
          <p className="mt-4 text-sm text-[#6b6256]">
            New student?{" "}
            <Link className="font-semibold text-teal-800" href="/register">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-sm text-[#6b6256]">
            Staff instead?{" "}
            <Link className="font-semibold text-teal-800" href="/login/teacher">
              Teacher login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
