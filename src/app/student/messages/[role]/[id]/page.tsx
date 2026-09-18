import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageForm } from "@/components/Forms";
import { PageHeader } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getPersonName, listThread } from "@/lib/data";
import { cn, formatDateTime } from "@/lib/utils";

export default async function StudentThreadPage({
  params,
}: {
  params: Promise<{ role: string; id: string }>;
}) {
  const user = await requireStudent();
  const { role, id } = await params;
  if (role !== "student" && role !== "teacher") notFound();
  const otherId = Number(id);
  if (!Number.isInteger(otherId)) notFound();

  const person = await getPersonName(role, otherId);
  if (!person) notFound();
  const thread = await listThread("student", user.id, role, otherId);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Conversation"
        title={person.name}
        description={`${person.extra} · ${person.email}`}
        actions={
          <Link className="btn btn-ghost" href="/student/messages">
            Back to inbox
          </Link>
        }
      />
      <div className="card space-y-3 p-5">
        {thread.length === 0 ? <p className="text-sm text-[#6b6256]">No messages yet. Say hello below.</p> : null}
        {thread.map((message) => {
          const mine = message.senderRole === "student" && message.senderId === user.id;
          return (
            <div key={message.id} className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", mine ? "ml-auto bg-[#12324d] text-white" : "bg-[#f6f1e7] text-[#1b2430]")}>
              <p>{message.content}</p>
              <p className={cn("mt-1 text-[11px]", mine ? "text-white/70" : "text-[#7a7164]")}>{formatDateTime(message.createdAt)}</p>
            </div>
          );
        })}
      </div>
      <div className="card mt-4 p-5">
        <MessageForm receiverRole={role} receiverId={otherId} />
      </div>
    </div>
  );
}
