"use client";

import React, { useEffect, useState } from "react";
import MemberForm from "@/components/MemberForm";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Member } from "@/types/member";

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("id", unwrappedParams.id)
          .single();

        if (error) throw error;
        if (data) setMember(data as Member);
      } catch (err) {
        console.error("Error fetching member:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [unwrappedParams.id]);

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from('members')
        .update({
          name: data.name,
          gender: data.gender,
          age_group: data.age_group,
          goals: data.goals,
          posture_issues: data.posture_issues,
          pain_points: data.pain_points,
          remaining_tickets: data.remaining_tickets,
          notes: data.notes
        })
        .eq('id', unwrappedParams.id);
      
      if (error) throw error;
      
      router.push(`/members/${unwrappedParams.id}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '회원 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl flex items-center justify-center">
        <p className="text-gray-500 font-medium">회원 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
      <header className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => router.push(`/members/${unwrappedParams.id}`)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex flex-1 items-center gap-2">
          회원 정보 수정
        </h1>
      </header>
      {member && <MemberForm initialData={member} onSubmit={handleSubmit} onCancel={() => router.push(`/members/${unwrappedParams.id}`)} />}
    </div>
  );
}
