"use client";

import React from "react";
import Image from "next/image";
import { IconMail, IconUser, IconMessage } from "@tabler/icons-react";
import FloatingInput from "@/app/components/ui/input/FloatingInput";
import Button from "@/app/components/ui/button/Button";
import SectionHeader from "../../components/SectionHeader";

const ContactUs = () => {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* left form */}
          <div className="order-2 lg:order-1">
            <div className="max-w-xl space-y-8">
              <SectionHeader
                title="Contact Alpha"
                description="Reach out for support, questions, or assistance with your printing experience."
              />

              <form className="space-y-5">
                <FloatingInput
                  id="fullName"
                  name="fullName"
                  type="text"
                  label="Full Name"
                  icon={<IconUser size={18} />}
                />

                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  icon={<IconMail size={18} />}
                />

                <div
                  className="relative w-full min-w-0 rounded-md border transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500/20"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="absolute top-5 left-4 z-10"
                    style={{ color: "var(--muted)" }}
                  >
                    <IconMessage size={18} />
                  </span>

                  <textarea
                    id="message"
                    name="message"
                    placeholder=" "
                    rows={6}
                    className="peer w-full resize-none rounded-md bg-transparent pt-6 pb-3 pr-4 pl-12 text-sm outline-none"
                    style={{ color: "var(--foreground)" }}
                  />

                  <label
                    htmlFor="message"
                    className="pointer-events-none absolute left-11 top-6 z-[1] px-1 text-sm transition-all duration-200 ease-out peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
                    style={{
                      color: "var(--muted)",
                      background: "var(--surface)",
                    }}
                  >
                    Message
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="md">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* right image */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative overflow-hidden ">
                <Image
                  src="/mainPage/contact/contact.png"
                  alt="Contact Alpha"
                  width={900}
                  height={900}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
