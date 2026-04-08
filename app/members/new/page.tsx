"use client";

import React from "react";
import MemberForm from "@/components/MemberForm";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMemberPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from('members').insert([{
        name: data.name,
        gender: data.gender,
        age_group: data.age_group,
        goals: data.goals,
        posture_issues: data.posture_issues,
        pain_points: data.pain_points,
        remaining_tickets: data.remaining_tickets,
        notes: data.notes
      }]);
      
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '회원 등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
      <header className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex flex-1 items-center gap-2">
          신규 회원 추가
        </h1>
      </header>
      <MemberForm onSubmit={handleSubmit} onCancel={() => router.push('/')} />
    </div>
  );
}
