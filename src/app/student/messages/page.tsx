import Link from "next/link";
import { ComposeForm } from "@/components/Forms";
import { EmptyState, PageHeader } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { listConversations, messageRecipientsForStudent } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function StudentMessagesPage() {
  const user = await requireStudent();
  const conversations = await listConversations("student", user.id);
  const recipients = await messageRecipientsForStudent(user);

  return (
    <div>
      <PageHeader
        kicker="Inbox"
        title="Messages"
        description="Talk with your leader, teammates, applicants, or teachers."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ComposeForm
          students={recipients.students}
          teachers={recipients.teachers}
          selfId={user.id}
          selfRole="student"
        />
        <section>
          {conversations.length === 0 ? (
            <EmptyState title="No conversations yet" text="Start one from the compose box." />
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Link
                  key={`${conversation.otherRole}-${conversation.otherId}`}
                  href={`/student/messages/${conversation.otherRole}/${conversation.otherId}`}
                  className="card block p-4 hover:bg-[#fbf6ec]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#12324d]">{conversation.otherName}</p>
                    {conversation.unread > 0 ? (
                      <span className="rounded-full bg-[#c4a35a] px-2 text-xs font-bold">{conversation.unread}</span>
                    ) : (
                      <span className="text-xs uppercase tracking-wide text-[#7a7164]">{conversation.otherRole}</span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[#5d564b]">{conversation.lastMessage}</p>
                  <p className="mt-2 text-xs text-[#7a7164]">{formatDateTime(conversation.lastAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
