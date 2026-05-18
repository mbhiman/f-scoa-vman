"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarClock, CheckCircle2, Clock, Mail, MessageCircle, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchNotificationDetail, type Notification } from "@/hooks/useNotifications";

const channelIcons = { EMAIL: Mail, WHATSAPP: MessageCircle, SMS: Smartphone };
const statusMeta = {
  SENT: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600" },
  FAILED: { icon: AlertCircle, className: "bg-red-500/10 text-red-600" },
  PENDING: { icon: Clock, className: "bg-amber-500/10 text-amber-600" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col py-2 border-b border-admin-border/40 last:border-0">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted-foreground">{label}</span>
    <span className="mt-0.5 text-[13px] font-medium text-admin-fg break-all">{value ?? "—"}</span>
  </div>
);

export default function NotificationDetailModal({ id, onClose }: { id: number | null, onClose: () => void }) {
  const [data, setData] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setData(null); setError(""); return; }
    const fetchDetail = async () => {
      try {
        setLoading(true); setError("");
        setData(await fetchNotificationDetail(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch log.");
      } finally {
        setLoading(false);
      }
    };
    void fetchDetail();
  }, [id]);

  const ChannelIcon = data ? channelIcons[data.channel] : Mail;
  const statusEntry = data && data.status in statusMeta ? statusMeta[data.status as keyof typeof statusMeta] : { icon: Clock, className: "bg-admin-muted/10 text-admin-muted-foreground" };
  const StatusIcon = data ? statusEntry.icon : Clock;

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-admin-border/60 bg-admin-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-admin-border/60 px-5 py-4 shrink-0 bg-admin-bg/30">
              <div>
                <h2 className="text-[15px] font-bold text-admin-fg">Delivery Details</h2>
                <p className="text-[11px] text-admin-muted-foreground mt-0.5">Log ID: #{id}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-6 w-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[13px] text-admin-muted-foreground">Loading payload data...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-[13px] text-red-500 text-center">
                  {error}
                </div>
              ) : data ? (
                <div className="flex flex-col gap-6">

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded bg-admin-bg border border-admin-border/60 px-2.5 py-1 text-[11px] font-semibold text-admin-fg">
                      <ChannelIcon className="h-3.5 w-3.5 text-admin-primary" /> {data.channel}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusEntry.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" /> {data.status}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded bg-admin-bg border border-admin-border/60 px-2.5 py-1 text-[11px] font-semibold text-admin-fg">
                      <CalendarClock className="h-3.5 w-3.5 text-admin-muted-foreground" /> {formatDate(data.sentAt ?? data.createdAt)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                    <DetailItem label="Recipient" value={data.recipient} />
                    <DetailItem label="Template" value={data.template} />
                    <DetailItem label="Provider" value={data.provider} />
                    <DetailItem label="Job Name" value={data.jobName} />
                    <DetailItem label="Created At" value={formatDate(data.createdAt)} />
                    <DetailItem label="Delivery Attempts" value={data.attempts} />
                  </div>

                  <DetailItem label="Subject / Title" value={data.subject} />

                  {data.errorMessage && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                      <span className="text-[11px] font-bold uppercase text-red-600 mb-1 block">Provider Error</span>
                      <p className="text-[13px] text-red-600 font-medium">{data.errorMessage}</p>
                    </div>
                  )}

                  {/* Code Block */}
                  <div className="flex flex-col mt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted-foreground mb-2">Raw Provider Response</span>
                    <div className="rounded-lg border border-admin-border/60 bg-admin-bg overflow-hidden">
                      <pre className="max-h-64 overflow-auto p-4 text-[11px] sm:text-[12px] leading-relaxed text-admin-fg font-mono custom-scrollbar">
                        {JSON.stringify(data.providerResponse ?? { message: "No payload recorded." }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}