import SectionHeader from "../components/SectionHeader";
import Button from "@/app/components/ui/button/Button";

const SSO = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 p-6">
      <SectionHeader
        title="Continue with KFUPM Account"
        description="Sign in securely using KFUPM Single Sign-On."
      />

      <Button>Continue with KFUPM</Button>
    </div>
  );
};

export default SSO;
