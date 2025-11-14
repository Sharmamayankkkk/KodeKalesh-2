"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Check, X, ChevronRight } from 'lucide-react';
import AlertActionModal from "./alert-action-modal";

interface AlertsTableProps {
  alerts: any[];
  loading: boolean;
  onAlertsChange: () => void;
}

export default function AlertsTable({ alerts, loading, onAlertsChange }: AlertsTableProps) {
  const supabase = createClient();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionType, setActionType] = useState<"acknowledge" | "resolve" | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning border-warning/20";
      case "medium":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted-background text-muted-foreground border-border";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-destructive/10 text-destructive";
      case "acknowledged":
        return "bg-info/10 text-info";
      case "resolved":
        return "bg-success/10 text-success";
      case "dismissed":
        return "bg-muted-background text-muted-foreground";
      default:
        return "bg-muted-background text-muted-foreground";
    }
  };

  const handleQuickAction = (alert: any, type: "acknowledge" | "resolve") => {
    setSelectedAlert(alert);
    setActionType(type);
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No alerts to display</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted-background">
              <tr>
                <th className="text-left p-4 font-semibold text-foreground">Alert</th>
                <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Patient</th>
                <th className="text-left p-4 font-semibold text-foreground">Severity</th>
                <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Status</th>
                <th className="text-left p-4 font-semibold text-foreground hidden lg:table-cell">Time</th>
                <th className="text-center p-4 font-semibold text-foreground w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr
                  key={alert.id}
                  className={`border-b border-border hover:bg-muted-background transition ${
                    idx % 2 === 1 ? "bg-muted-background/50" : ""
                  }`}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.description?.substring(0, 60)}...
                      </p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <Link
                      href={`/dashboard/patients/${alert.patient_id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {alert.patients?.first_name} {alert.patients?.last_name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded border ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusBadge(
                        alert.status
                      )}`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell text-xs">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {alert.status === "open" && (
                        <>
                          <button
                            onClick={() => handleQuickAction(alert, "acknowledge")}
                            className="p-1.5 hover:bg-primary/10 rounded text-primary transition"
                            title="Acknowledge"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickAction(alert, "resolve")}
                            className="p-1.5 hover:bg-success/10 rounded text-success transition"
                            title="Resolve"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/dashboard/alerts/${alert.id}`}
                        className="p-1.5 hover:bg-muted-background rounded text-muted-foreground transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAlert && actionType && (
        <AlertActionModal
          alert={selectedAlert}
          actionType={actionType}
          onClose={() => {
            setSelectedAlert(null);
            setActionType(null);
          }}
          onActionComplete={() => {
            setSelectedAlert(null);
            setActionType(null);
            onAlertsChange();
          }}
        />
      )}
    </div>
  );
}
