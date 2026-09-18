import { redirect } from "next/navigation";
import { CreateGroupForm } from "@/components/Forms";
import { PageHeader } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { listSupervisors } from "@/lib/data";

export default async function CreateGroupPage() {
  const user = await requireStudent();
  if (user.groupId) redirect("/student/my-group");
  const teachers = await listSupervisors();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        kicker="New team"
        title="Create a group"
        description="You become the team leader and are added as the first member. Maximum size is 6."
      />
      <CreateGroupForm teachers={teachers} />
    </div>
  );
}
