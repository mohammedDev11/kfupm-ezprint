"use client";

import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import {
  getCurrentSession,
  loginLocal,
  logoutAllSessions,
} from "@/services/api";
import { ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";

type LoginTarget = "user" | "admin";

const DEMO_LOGINS = [
  {
    label: "Admin",
    username: "admin",
    password: "12345678",
    targetArea: "admin" as LoginTarget,
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: "SubAdmin",
    username: "subadmin",
    password: "12345678",
    targetArea: "admin" as LoginTarget,
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: "Real User",
    username: "202279720",
    password: "12345678",
    targetArea: "user" as LoginTarget,
    icon: <UserRound className="h-4 w-4" />,
  },
];

const SSO = () => {
  const router = useRouter();
  const currentSession = useMemo(() => getCurrentSession(), []);
  const [emailOrUsername, setEmailOrUsername] = useState(
    currentSession?.user?.username || "",
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionSummary, setSessionSummary] = useState(currentSession);
  const [targetArea, setTargetArea] = useState<LoginTarget>("user");

  const redirectForSession = (role: string, nextTargetArea = targetArea) => {
    const canUseAdminArea = role === "Admin" || role === "SubAdmin";

    router.push(
      nextTargetArea === "admin" && canUseAdminArea
        ? "/sections/admin/dashboard"
        : "/sections/user/dashboard",
    );
  };

  const handleLogin = async (
    nextUsername = emailOrUsername,
    nextPassword = password,
  ) => {
    setLoading(true);
    setError("");

    try {
      const session = await loginLocal({
        emailOrUsername: nextUsername,
        password: nextPassword,
      });

      setSessionSummary(session);
      redirectForSession(session.user.role);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to log in with the provided credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-center px-6 py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeader
            title="Temporary Local Login"
            description="Use any real Admin Users username with password 12345678. Admin and SubAdmin accounts route to admin, while every signed-in account can also use the user flow."
          />

          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              {DEMO_LOGINS.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => {
                    setEmailOrUsername(demo.username);
                    setPassword(demo.password);
                    setTargetArea(demo.targetArea);
                  }}
                  className="flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition hover:border-brand-500/50 hover:bg-brand-50/20"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <span className="mt-1 text-brand-500">{demo.icon}</span>
                  <span>
                    <span className="block font-semibold text-[var(--title)]">
                      {demo.label}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      {demo.username} / {demo.password}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="title-md">Sign In</h2>
          <p className="paragraph mt-2">
            Sign in with a real database username and the temporary local
            password. The old admin/admin123 shortcut is still accepted locally.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Username or email
              </label>
              <Input
                value={emailOrUsername}
                onChange={(event) => setEmailOrUsername(event.target.value)}
                placeholder="202279720, admin, or subadmin"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="12345678"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Open area after sign in
              </label>
              <SegmentToggle
                options={[
                  {
                    value: "user",
                    label: "User Area",
                    icon: <UserRound className="h-4 w-4" />,
                  },
                  {
                    value: "admin",
                    label: "Admin Area",
                    icon: <ShieldCheck className="h-4 w-4" />,
                  },
                ]}
                value={targetArea}
                onChange={(value) => setTargetArea(value as LoginTarget)}
                className="w-full justify-center"
                buttonClassName="flex-1"
              />
              <p className="text-xs text-[var(--muted)]">
                Admin Area opens only for Admin and SubAdmin accounts.
              </p>
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !emailOrUsername || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div
            className="mt-6 rounded-2xl border px-4 py-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <p className="text-sm font-semibold text-[var(--title)]">
              Current local session
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {sessionSummary
                ? `${sessionSummary.user.fullName} (${sessionSummary.user.role})`
                : "No local session stored yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {sessionSummary ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      redirectForSession(sessionSummary.user.role)
                    }
                  >
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logoutAllSessions();
                      setSessionSummary(null);
                    }}
                  >
                    Sign Out All
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SSO;
