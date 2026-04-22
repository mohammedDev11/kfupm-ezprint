"use client";

import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { useState } from "react";
import { FileUploadDemo } from "./components/FileUploadDemo";
import PrintJobModal from "./components/PrintJobModal";

const Page = () => {
  const [openModal, setOpenModal] = useState(false);
  const [jobName, setJobName] = useState("");
  const [queue, setQueue] = useState("Secure Release");

  const handleConfirmPrint = (options: {
    copies: number;
    color: string;
    duplex: string;
  }) => {
    console.log("Print Job Submitted:", {
      jobName,
      queue,
      ...options,
    });

    setOpenModal(false);
  };

  return (
    <div className="space-y-5">
      <PageIntro
        title="Web Print"
        description="Upload and print documents from your browser"
      />

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setOpenModal(true);
        }}
      >
        <FileUploadDemo />

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            className="mx-auto w-full lg:w-[90%] xl:w-[90%] 2xl:w-[90%]"
            type="submit"
          >
            Submit Print Job
          </Button>
        </div>
      </form>

      <PrintJobModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        jobName={jobName}
        setJobName={setJobName}
        queue={queue}
        setQueue={setQueue}
        onConfirm={handleConfirmPrint}
      />
    </div>
  );
};

export default Page;
