"use client";

/**
 * Notifications Page
 * ---------------------------------------
 * This is the main container for:
 * - Notifications table (monitoring alerts)
 * - Settings panel (configure notification rules)
 *
 * Responsibilities:
 * - Manage state (notifications, filters, selection, settings)
 * - Handle business logic (filtering, actions, updates)
 * - Pass data to child components
 */

import PageIntro from "@/app/components/shared/page/Text/PageIntro";
import { useEffect, useMemo, useState } from "react";

// Feature components
import NotificationSettingsPanel from "./components/NotificationSettingsPanel";
import NotificationSummaryCards from "./components/NotificationSummaryCards";
import NotificationTable from "./components/NotificationTable";

// Data + types (acts as mock backend)
import {
  DEFAULT_NOTIFICATION_FILTERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_SETTINGS,
  NOTIFICATION_TABS,
  Notification,
  NotificationFilters,
  NotificationSettingsType,
  NotificationStatus,
  NotificationTab,
  TOTAL_SECONDS,
} from "@/Data/Admin/notifications";

export default function NotificationsPage() {
  /**
   * ===============================
   * STATE MANAGEMENT
   * ===============================
   */

  // Current tab (Notifications / Settings)
  const [tab, setTab] = useState<NotificationTab>("Notifications");

  // Notification list (mock data source)
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );

  // Filters (search, type, severity, etc.)
  const [filters, setFilters] = useState<NotificationFilters>(
    DEFAULT_NOTIFICATION_FILTERS
  );

  // Notification settings (toggles + thresholds)
  const [settings, setSettings] = useState<NotificationSettingsType>(
    INITIAL_NOTIFICATION_SETTINGS
  );

  // Refresh timer (used in RefreshTimer component)
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  // Selected rows in table (checkbox selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /**
   * ===============================
   * AUTO REFRESH TIMER
   * ===============================
   * Decreases every second.
   * When it reaches 0 → resets.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) return TOTAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /**
   * Manual refresh handler
   * - Resets filters
   * - Clears selection
   * - Resets timer
   */
  const handleRefreshNow = () => {
    setFilters(DEFAULT_NOTIFICATION_FILTERS);
    setSelectedIds([]);

    setSecondsLeft(0);

    // Smooth reset animation
    setTimeout(() => {
      setSecondsLeft(TOTAL_SECONDS);
    }, 900);
  };

  /**
   * ===============================
   * FILTERING LOGIC
   * ===============================
   * Filters notifications based on:
   * - search text
   * - type
   * - severity
   * - status
   * - source
   */
  const filteredNotifications = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !term ||
        notification.title.toLowerCase().includes(term) ||
        notification.message.toLowerCase().includes(term) ||
        notification.affected_device?.toLowerCase().includes(term);

      const matchesType =
        filters.type === "all" || notification.type === filters.type;

      const matchesSeverity =
        filters.severity === "all" ||
        notification.severity === filters.severity;

      const matchesStatus =
        filters.status === "all" || notification.status === filters.status;

      const matchesSource =
        filters.source === "all" || notification.source === filters.source;

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus &&
        matchesSource
      );
    });
  }, [notifications, filters]);

  /**
   * ===============================
   * ACTION HANDLERS
   * ===============================
   */

  /**
   * Update status for selected notifications
   * (read, resolved, dismissed)
   */
  const updateNotificationStatus = (
    ids: string[],
    status: NotificationStatus
  ) => {
    setNotifications((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, status } : item))
    );

    // Clear selection after action
    setSelectedIds([]);
  };

  /**
   * Delete notifications (single or bulk)
   */
  const deleteNotifications = (ids: string[]) => {
    setNotifications((prev) => prev.filter((item) => !ids.includes(item.id)));

    setSelectedIds([]);
  };

  /**
   * Update settings (generic handler)
   */
  const updateSettings = <K extends keyof NotificationSettingsType>(
    key: K,
    value: NotificationSettingsType[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * ===============================
   * UI RENDER
   * ===============================
   */

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageIntro
        title="Notifications"
        description="Monitor system alerts, printer issues, and device warnings"
      />

      {/* Tabs (Notifications / Settings) */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          {NOTIFICATION_TABS.map((item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-t-md px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-muted"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===============================
          NOTIFICATIONS TAB
      =============================== */}
      {tab === "Notifications" ? (
        <div className="space-y-6">
          {/* Summary cards (stats) */}
          <NotificationSummaryCards notifications={notifications} />

          {/* Table + filters + actions */}
          <NotificationTable
            notifications={filteredNotifications}
            filters={filters}
            setFilters={setFilters}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            secondsLeft={secondsLeft}
            onRefreshNow={handleRefreshNow}
            // Bulk actions
            onBulkRead={(ids) => updateNotificationStatus(ids, "read")}
            onBulkResolve={(ids) => updateNotificationStatus(ids, "resolved")}
            onBulkDismiss={(ids) => updateNotificationStatus(ids, "dismissed")}
            onBulkDelete={deleteNotifications}
            // Row actions
            onResolveOne={(id) => updateNotificationStatus([id], "resolved")}
            onDismissOne={(id) => updateNotificationStatus([id], "dismissed")}
            onDeleteOne={(id) => deleteNotifications([id])}
          />
        </div>
      ) : (
        /**
         * ===============================
         * SETTINGS TAB
         * ===============================
         */
        <NotificationSettingsPanel
          settings={settings}
          updateSettings={updateSettings}
        />
      )}
    </div>
  );
}
