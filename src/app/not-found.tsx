import Link from "next/link";
import { Footer, PublicNav } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">404</p>
        <h1 className="font-display mt-2 text-4xl text-[#12324d]">That page is not on the roster.</h1>
        <p className="mt-3 text-[#5d564b]">The group or screen you requested does not exist.</p>
        <Link className="btn btn-primary mt-6" href="/">
          Back to FYDP Hub
        </Link>
      </main>
      <Footer />
    </div>
  );
}
