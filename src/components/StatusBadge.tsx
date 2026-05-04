const styles: Record<string, string> = {
  pending: "bg-sos/15 text-sos border-sos/30",
  responded: "bg-warning/15 text-warning-foreground border-warning/40",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  resolved: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const labels: Record<string, string> = {
  pending: "Pending",
  responded: "Responded",
  in_progress: "In Progress",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}