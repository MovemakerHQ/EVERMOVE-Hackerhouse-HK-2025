"use client";

import { NextPage } from "next";
import { useUserInfo } from "~~/services/store/store";
import { UserInfo } from "~~/types/emotion-apt/UserInfo";

const Profile: NextPage = () => {
  const userinfo = useUserInfo();

  // 需要展示的字段配置（排除方法）
  const displayFields = [
    { key: "name", label: "Name" },
    { key: "sex", label: "Sex" },
    { key: "date_of_birth", label: "Date of Birth" },
    { key: "education", label: "Education Background" },
    { key: "occupation", label: "Occupation Background" },
    { key: "counselling_hours", label: "Counselling Hours" },
    { key: "orientations", label: "Orientations" },
    { key: "techniques", label: "Techniques" },
    { key: "valid_msg", label: "Auth Code" },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-0">
      <div className="mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            <h1 className="card-title text-4xl font-bold text-primary mb-8">User Info</h1>

            {/* 基本信息区块 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Basic Information</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {displayFields.slice(0, 3).map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                    <p className="text-lg font-medium">
                      {(userinfo[key as keyof UserInfo] as string) || <span className="text-gray-400">Not Provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider my-8" />

            {/* 教育职业区块 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold border-l-4 border-secondary pl-4">Education & Occupation</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {displayFields.slice(3, 6).map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                    <p className="text-lg">
                      {(userinfo[key as keyof UserInfo] as string) || <span className="text-gray-400">Not Provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider my-8" />

            {/* 咨询信息区块 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold border-l-4 border-accent pl-4">Professional Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {displayFields.slice(6, 8).map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                    <div className="prose rounded-lg min-h-[100px]">
                      {(userinfo[key as keyof UserInfo] as string) || <span className="text-gray-400">Not Provided</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 认证状态 */}
            <div className="mt-8 p-4 bg-info/10 rounded-lg border border-info/20">
              <span className="font-semibold text-info">Auth Code：</span>
              <span className={userinfo.valid_msg ? "text-success" : "text-gray-500"}>
                {userinfo.valid_msg || "Not Generated"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
