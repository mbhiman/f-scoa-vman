"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarClock, CheckCircle2, Clock, Mail, MessageCircle, Smartphone, X, TerminalSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchNotificationDetail, type Notification } from "@/hooks/useNotifications";

const channelIcons = { EMAIL: Mail, WHATSAPP: MessageCircle, SMS: Smartphone };
const statusMeta = {
  SENT: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  FAILED: { icon: AlertCircle, className: "text-red-600 dark:text-red-400" },
  PENDING: { icon: Clock, className: "text-amber-600 dark:text-amber-400" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

const PropertyRow = ({ label, value, isCode = false }: { label: string; value?: string | number | null; isCode?: boolean }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 sm:py-3.5 border-b border-admin-border/40 last:border-0">
    <span className="text-[12px] font-medium text-admin-muted-foreground">{label}</span>
    <span className={`sm:col-span-2 text-[13px] text-admin-fg break-all ${isCode ? 'font-mono text-[12px] bg-admin-muted/5 px-1.5 py-0.5 rounded w-fit' : 'font-medium'}`}>
      {value ?? "—"}
    </span>
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
  const statusEntry = data && data.status in statusMeta ? statusMeta[data.status as keyof typeof statusMeta] : { icon: Clock, className: "text-admin-muted-foreground" };
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
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-admin-border/60 bg-admin-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-admin-border/60 px-5 sm:px-6 py-4 sm:py-5 shrink-0 bg-admin-bg/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-admin-primary/10 flex items-center justify-center text-admin-primary border border-admin-primary/20">
                  <TerminalSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] sm:text-base font-bold text-admin-fg tracking-tight">Delivery Log Details</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono text-admin-muted-foreground">ID: #{id}</span>
                    {data && (
                      <>
                        <span className="text-[10px] text-admin-border/50">•</span>
                        <span className={`flex items-center gap-1 text-[11px] font-bold tracking-wider ${statusEntry.className}`}>
                          <StatusIcon className="h-3 w-3" /> {data.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg transition-colors self-start"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-5 sm:px-6 py-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-6 w-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[13px] text-admin-muted-foreground font-medium">Fetching payload...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-[13px] text-red-500 text-center font-medium my-10">
                  {error}
                </div>
              ) : data ? (
                <div className="flex flex-col pb-4">

                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 p-4 rounded-lg bg-admin-bg border border-admin-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-admin-muted-foreground font-semibold mb-1">Channel</span>
                      <span className="text-[13px] font-semibold text-admin-fg flex items-center gap-1.5"><ChannelIcon className="w-3.5 h-3.5" /> {data.channel}</span>
                    </div>
                    <div className="w-px bg-admin-border/60 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-admin-muted-foreground font-semibold mb-1">Template</span>
                      <span className="text-[13px] font-semibold text-admin-fg capitalize">{data.template}</span>
                    </div>
                    <div className="w-px bg-admin-border/60 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-admin-muted-foreground font-semibold mb-1">Sent Date</span>
                      <span className="text-[13px] font-semibold text-admin-fg flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> {formatDate(data.sentAt ?? data.createdAt)}</span>
                    </div>
                  </div>

                  {/* Property Sheet */}
                  <h3 className="text-[13px] font-bold text-admin-fg mb-2 uppercase tracking-wide">Request Information</h3>
                  <div className="flex flex-col border-y border-admin-border/40">
                    <PropertyRow label="Recipient" value={data.recipient} />
                    <PropertyRow label="Subject / Job Name" value={data.subject ?? data.jobName} />
                    <PropertyRow label="Provider" value={data.provider} />
                    <PropertyRow label="Delivery Attempts" value={data.attempts} />
                    <PropertyRow label="Internal Job ID" value={data.jobId} isCode />
                    <PropertyRow label="System Creation Time" value={formatDate(data.createdAt)} />
                  </div>

                  {/* Error State Callout */}
                  {data.errorMessage && (
                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-red-600 mb-0.5 uppercase tracking-wide">Provider Error Raised</span>
                        <p className="text-[13px] text-red-600/90 leading-relaxed font-mono whitespace-pre-wrap">{data.errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Code Block Payload */}
                  <div className="flex flex-col mt-8">
                    <h3 className="text-[13px] font-bold text-admin-fg mb-3 uppercase tracking-wide">Raw Provider Payload</h3>
                    <div className="rounded-lg border border-admin-border/80 bg-[#0d1117] overflow-hidden shadow-inner">
                      <div className="flex items-center px-4 py-2 border-b border-white/10 bg-white/5">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                        </div>
                        <span className="ml-3 text-[10px] font-mono text-slate-400">response.json</span>
                      </div>
                      <pre className="max-h-72 overflow-auto p-4 text-[12px] leading-relaxed text-slate-300 font-mono custom-scrollbar">
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