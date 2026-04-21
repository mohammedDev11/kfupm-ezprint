"use client";

import React from "react";
import Link from "next/link";
import Card from "@/app/components/ui/card/Card";
import { userQuickActions } from "@/Data/User/dashboard";

const UserQuickActions = () => {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="title-md">Quick Actions</h2>
      </div>

      <div className="space-y-4">
        {userQuickActions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group block rounded-md"
            >
              <div
                className="flex items-center gap-4 rounded-md px-5 py-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: isPrimary
                    ? "var(--color-brand-500)"
                    : "var(--surface-2)",
                  color: isPrimary ? "#ffffff" : "var(--title)",
                  border: isPrimary
                    ? "1px solid transparent"
                    : "1px solid var(--border)",
                }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-md transition"
                  style={{
                    background: isPrimary
                      ? "rgba(255,255,255,0.14)"
                      : "var(--surface)",
                    color: isPrimary ? "#ffffff" : "var(--color-brand-500)",
                    border: isPrimary
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid var(--border)",
                  }}
                >
                  <Icon size={22} />
                </span>

                <span
                  className="text-lg font-semibold"
                  style={{
                    color: isPrimary ? "#ffffff" : "var(--title)",
                  }}
                >
                  {action.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default UserQuickActions;
