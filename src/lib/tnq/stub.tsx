import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, EmptyState } from "@/components/tnq/ui";
import { Construction } from "lucide-react";

export function makeStub(path: string, title: string, subtitle: string) {
  return createFileRoute(path as any)({
    component: () => (
      <div>
        <PageHeader title={title} subtitle={subtitle} />
        <Card>
          <EmptyState
            icon={<Construction className="h-10 w-10" />}
            title="Coming online soon"
            subtitle="This module is part of the TnQ Hub build. The schema, RLS, and navigation are in place — UI for this page is next."
          />
        </Card>
      </div>
    ),
  });
}
