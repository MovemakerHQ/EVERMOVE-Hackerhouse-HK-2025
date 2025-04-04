"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-hot-toast";
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const { account } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const { submitTransaction, transactionResponse } = useSubmitTransaction("user_info");
  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      if (transactionResponse.success) {
        toast.success("Clean My Profile Successful");
        window.location.href = "/";
      } else {
        toast.error("Clean My Profile Failed");
      }
    }
  }, [transactionResponse]);
  if (!account?.address) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Emotion Apt</span>
            <span className="block text-4xl font-bold">Please Connect Your Wallet</span>
            <button className="btn btn-primary mt-10" onClick={() => router.push("/")}>
              Back To Home
            </button>
          </h1>
        </div>
      </div>
    );
  }
  const onClean = async () => {
    try {
      await submitTransaction("delete", []);
    } catch (e) {
      toast.error("Failed to clean profile");
    }
  };
  return (
    <div>
      <div className="flex items-start flex-row flex-grow pt-5 mr-5 ml-5 justify-between">
        <div className="tabs tabs-boxed bg-info">
          <Link href="/profile" className={`tab ${pathname === "/profile" ? "tab-active" : ""}`}>
            Info
          </Link>
          <Link
            href="/profile/records"
            className={`tab ${pathname.startsWith("/profile/records") ? "tab-active" : ""}`}
          >
            Records
          </Link>
          <Link href="/profile/scales" className={`tab ${pathname.startsWith("/profile/scales") ? "tab-active" : ""}`}>
            Scales
          </Link>
        </div>
        <div>
          <button className="btn btn-warning btn-sm" onClick={onClean}>
            Clean My Profile
          </button>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default ProfileLayout;
