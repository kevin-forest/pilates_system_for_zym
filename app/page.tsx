"use client";

import React, { useState, useEffect } from "react";
import { Member } from "@/types/member";
import { User, Activity, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PilatesDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase.from("members").select("*");
        if (error) throw error;
        if (data) {
          setMembers(data as Member[]);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          필라테스 회원 관리
        </h1>
        <p className="text-sm text-gray-500 mt-1">오늘의 예약 및 회원 현황을 확인하세요.</p>
      </header>

      {/* Member List */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 font-medium">회원 정보를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => {
            const isLowTicket = member.remaining_tickets <= 2;

            return (
              <Link href={`/members/${member.id}`} key={member.id} className="block group">
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-sm group-hover:shadow-md
                  ${
                    isLowTicket
                      ? "border-red-300 ring-1 ring-red-100"
                      : "border-gray-100"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${
                          isLowTicket
                            ? "bg-red-50 text-red-600"
                            : "bg-indigo-50 text-indigo-600"
                        }
                      `}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        {member.name}
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {member.age_group}
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold
                        ${
                          isLowTicket
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      `}
                    >
                      {isLowTicket && <AlertCircle className="w-3.5 h-3.5" />}
                      잔여 {member.remaining_tickets}회
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700 block mb-1">
                      주요 통증 부위
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.pain_points.map((point) => (
                        <span
                          key={point}
                          className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md shadow-sm"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                    {member.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="font-semibold text-gray-700 block mb-1">
                          특이사항
                        </span>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {member.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
          </div>
        )}
      </main>

      {/* FAB: + 버튼 */}
      <Link href="/members/new" className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 transition-all transform hover:scale-105 z-20">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
      </Link>
    </div>
  );
}
