import React from "react";

export type TimelineEvent = {
  id: string;
  time: string;
  label: string;
  status?: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="flex flex-col gap-4">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4 items-start relative">
          {i !== events.length - 1 && (
            <div className="absolute top-6 left-2.5 w-px h-full bg-border -z-10" />
          )}
          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 border ${
            event.status === "SUCCESS" ? "bg-success/20 border-success" :
            event.status === "ERROR" ? "bg-danger/20 border-danger" :
            event.status === "WARNING" ? "bg-warning/20 border-warning" :
            "bg-surface-2 border-border"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              event.status === "SUCCESS" ? "bg-success" :
              event.status === "ERROR" ? "bg-danger" :
              event.status === "WARNING" ? "bg-warning" :
              "bg-muted"
            }`} />
          </div>
          <div className="flex flex-col gap-1 pb-4">
            <span className="text-xs font-mono text-muted">{event.time}</span>
            <span className="text-sm">{event.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
