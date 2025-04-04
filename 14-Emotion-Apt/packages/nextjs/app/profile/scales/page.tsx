"use client";

import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { toast } from "react-hot-toast";
import { useView } from "~~/hooks/scaffold-move/useView";
import { useGlobalState } from "~~/services/store/store";
import { Record } from "~~/types/emotion-apt/UserInfo";
import { decryptWithEmbeddedSalt } from "~~/utils/emotion-apt/encrypt";

const RecordsPage: NextPage = () => {
  const store = useGlobalState();
  const { data, error } = useView({
    moduleName: "records",
    functionName: "get_all_records",
    args: [store.address as `0x${string}`],
  });
  const [records, setRecords] = useState<Record[]>([]);
  const recordsEn = useRef<Record[]>([]);

  useEffect(() => {
    if (error) {
      toast.error("Error: " + error);
    }
    if (data) {
      recordsEn.current = data[0] as unknown as Record[];
      renderRecords();
    }
  }, [data, error, store.password]);
  const renderRecords = async () => {
    const recordsLocal = [];
    for (let i = 0; i < recordsEn.current.length; i++) {
      const keyword = await decryptWithEmbeddedSalt(store.password, recordsEn.current[i].keywords);
      const description = await decryptWithEmbeddedSalt(store.password, recordsEn.current[i].description);
      recordsLocal.push({ keywords: keyword, description: description, timestamp: recordsEn.current[i].timestamp });
    }
    setRecords(recordsLocal);
    console.log(records);
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Records</h1>

      {records.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>No records found</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {new Date(parseInt(record.timestamp) * 1000).toLocaleDateString() +
                    " " +
                    new Date(parseInt(record.timestamp) * 1000).toLocaleTimeString()}
                </h2>
                <div className="badge badge-outline badge-secondary mb-2">
                  {record.keywords.split(", ").length} tags
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {record.keywords.split(", ").map((keyword, i) => (
                    <span key={i} className="badge badge-primary">
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="collapse collapse-arrow border border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">View Description</div>
                  <div className="collapse-content collapse-open">
                    <p className="text-gray-500">{record.description}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mt-4">
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default RecordsPage;
