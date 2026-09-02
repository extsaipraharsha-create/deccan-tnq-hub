import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/tnq/ui";
import { WorklogReport } from "@/components/tnq/WorklogReport";
import { useAuth } from "@/lib/tnq/auth-context";

function MyReportPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="My Report" subtitle="Your worklog activity, all in one place" />
      {user && <WorklogReport userId={user.id} />}
    </div>
  );
}
export const Route = createFileRoute("/_app/my-report")({ component: MyReportPage });
