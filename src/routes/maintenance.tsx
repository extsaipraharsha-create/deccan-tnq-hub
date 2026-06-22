import { createFileRoute } from "@tanstack/react-router";
import { Settings as Gear } from "lucide-react";

export const Route = createFileRoute("/maintenance")({ component: Maintenance });

function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-full bg-warning/15 flex items-center justify-center text-warning">
          <Gear className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">TnQ Hub is under maintenance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We're improving things. Check back shortly.
        </p>
      </div>
    </div>
  );
}
