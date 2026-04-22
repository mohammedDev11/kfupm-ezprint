import PageIntro from "@/components/shared/page/Text/PageIntro";
import ReportsPanel from "./components/ReportsPanel";

const page = () => {
  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        title="Reports"
        description="Analyze printing activity, usage statistics, and system performance through reports."
      />
      <ReportsPanel />
    </div>
  );
};

export default page;
