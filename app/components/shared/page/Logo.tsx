import React from "react";
import Link from "next/link";
import Image from "next/image";
import favicon from "@/app/favicon.ico";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="bg-brand-900 rounded-md p-1.5">
        <Image src={favicon} alt="logo" width={18} height={18} />
      </div>
      <span className="text-base font-semibold tracking-tight">
        Alpha Queue
      </span>
    </Link>
  );
};

export default Logo;
