"use client";

import React, { useState } from "react";
import Image from "next/image";
import SectionHeader from "../../components/SectionHeader";
import { Faq } from "./Faq";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import AskQuestion from "./AskQuestion";

const Questions = () => {
  const [open, setOpen] = useState(false);

  const faqItems = [
    {
      id: "q1",
      title: "How do I print a file using Alpha?",
      content:
        "Sign in to your account, upload your document, and send it to a printer queue. Your job will remain securely stored until you authenticate at the printer and release it.",
    },
    {
      id: "q2",
      title: "Is my document private and secure?",
      content:
        "Yes. Your file is stored in a secure queue and can only be accessed by you. It is automatically deleted after printing or when the retention period expires.",
    },
    {
      id: "q3",
      title: "What happens if my balance is insufficient?",
      content:
        "The system verifies your balance before printing. If your balance or quota is not enough, the job will not be released until you add sufficient credit.",
    },
    {
      id: "q4",
      title: "Can I track my print activity?",
      content:
        "Yes. You can view your recent print jobs, transaction history, and usage details directly from your dashboard.",
    },
    {
      id: "q5",
      title: "What happens after my file is printed?",
      content:
        "Once printing is completed, the job is removed from the queue and the file is automatically deleted to ensure your privacy.",
    },
  ];

  return (
    <>
      <section id="faq" className="section">
        <div className="container">
          <div className="space-y-10">
            {/* top row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                title="Frequently Asked Questions"
                description="Everything you need to know about uploading, securing, and releasing your print jobs with Alpha."
              />

              <div className="shrink-0">
                <Button onClick={() => setOpen(true)}>Need More Help?</Button>
              </div>
            </div>

            {/* bottom row */}
            <div className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
              {/* left image */}
              <div className="relative mx-auto w-full max-w-[320px] lg:mx-0">
                <div className="relative overflow-hidden ">
                  <Image
                    src="/mainPage/faq/faq.png"
                    alt="FAQ illustration"
                    width={700}
                    height={700}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              {/* right faq */}
              <div className="w-full">
                <Faq allowMultiple={false}>
                  {faqItems.map((item) => (
                    <Faq.Item key={item.id} id={item.id} title={item.title}>
                      {item.content}
                    </Faq.Item>
                  ))}
                </Faq>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AskQuestion />
      </Modal>
    </>
  );
};

export default Questions;
