import PageIntro from "@/app/components/shared/page/Text/PageIntro";
import JobsPendingReleaseTable from "./components/JobsPendingReleaseTable";

const page = () => {
  return (
    <div>
      <PageIntro
        title="Jobs Pending Release"
        description="Review your held print jobs, check the total cost, and release them when ready."
      />{" "}
      <JobsPendingReleaseTable />
    </div>
  );
};

export default page;
