"use client";

import { informationSections } from "@/lib/mock-data/User/profile";
import { apiGet } from "@/services/api";
import {
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  UserRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const iconMap: Record<string, React.ReactNode> = {
  "personal-information": <UserRound className="h-5 w-5" />,
  "university-information": <GraduationCap className="h-5 w-5" />,
  "printing-identity": <Printer className="h-5 w-5" />,
};

const fieldIconMap: Record<string, React.ReactNode> = {
  "Email Address": <Mail className="h-4 w-4" />,
  "Phone Number": <Phone className="h-4 w-4" />,
  "Primary Card ID": <CreditCard className="h-4 w-4" />,
};

const Information = () => {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );
  const [sections, setSections] = useState(informationSections);

  const toggleVisibility = (fieldId: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  useEffect(() => {
    let mounted = true;

    apiGet<{ informationSections: typeof informationSections }>(
      "/user/profile",
      "user",
    )
      .then((data) => {
        if (!mounted || !data?.informationSections?.length) return;
        setSections(data.informationSections);
      })
      .catch(() => {
        // Keep mock fallback for resilience.
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} className="card rounded-md p-6 sm:p-7">
          <div className="mb-6 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border"
              style={{
                background: "var(--surface-2)",
                color: "var(--title)",
                borderColor: "var(--border)",
              }}
            >
              {iconMap[section.id]}
            </div>

            <div className="min-w-0">
              <h3
                className="text-lg font-semibold sm:text-xl"
                style={{ color: "var(--title)" }}
              >
                {section.title}
              </h3>

              {section.description ? (
                <p
                  className="mt-1 text-sm sm:text-base"
                  style={{ color: "var(--paragraph)" }}
                >
                  {section.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => {
              const isVisible = visibleFields[field.id];
              const fieldIcon = fieldIconMap[field.label];

              return (
                <div
                  key={field.id}
                  className="rounded-md border p-4"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div
                        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        {fieldIcon ? (
                          <span className="flex items-center justify-center">
                            {fieldIcon}
                          </span>
                        ) : null}

                        <span>{field.label}</span>
                      </div>

                      <div
                        className="break-words text-sm font-semibold sm:text-base"
                        style={{ color: "var(--title)" }}
                      >
                        {field.sensitive && !isVisible
                          ? "••••••••••••"
                          : field.value}
                      </div>
                    </div>

                    {field.sensitive ? (
                      <button
                        type="button"
                        onClick={() => toggleVisibility(field.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--muted)",
                        }}
                        aria-label={isVisible ? "Hide value" : "Show value"}
                        title={isVisible ? "Hide value" : "Show value"}
                      >
                        {isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Information;
