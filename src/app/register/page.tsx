import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/Forms";
import { Footer, PublicNav } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.kind === "student") redirect("/student/dashboard");
  if (session?.kind === "teacher") redirect("/teacher/dashboard");

  return (
    <div>
      <PublicNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">New student</p>
          <h1 className="font-display mt-2 text-4xl text-[#12324d]">Register for FYDP Hub.</h1>
          <p className="mt-3 max-w-md text-[#5d564b]">
            Use your university email and roll number. After signing up you can browse open groups or create a team of your own.
          </p>
        </div>
        <div className="card p-6">
          <RegisterForm />
          <p className="mt-4 text-sm text-[#6b6256]">
            Already registered?{" "}
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
