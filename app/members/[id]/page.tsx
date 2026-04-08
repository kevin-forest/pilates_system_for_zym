"use client";

import React, { useState, useEffect } from "react";
import { Member } from "@/types/member";
import { supabase } from "@/lib/supabase";
import { User, Activity, AlertCircle, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function MemberDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [apparatus, setApparatus] = useState("리포머");
  const [target, setTarget] = useState("");
  
  const [sequence, setSequence] = useState("");
  const [usedModel, setUsedModel] = useState("");
  const [generating, setGenerating] = useState(false);

  const getAccuracyLabel = (model: string) => {
    switch (model) {
      case "gemini-2.5-pro": return "고도의 정밀 분석 (정확도 95% 이상)";
      case "gemini-2.5-flash": return "우수한 맞춤 분석 (정확도 85% 이상)";
      case "gemini-2.0-flash": return "표준 기본 분석 (정확도 75% 이상)";
      default: return "";
    }
  };

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

  const generateSequence = async () => {
    if (!member) return;
    if (!target.trim()) {
      alert("타겟 부위를 입력해 주세요.");
      return;
    }
    setGenerating(true);
    setSequence("");
    setUsedModel("");

    try {
      const response = await fetch("/api/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: member.goals.join(", "),
          posture: member.posture_issues.join(", "),
          pain: member.pain_points.join(", "),
          apparatus,
          target,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "알 수 없는 API 에러");
      }

      const data = await response.json();
      setSequence(data.sequence);
      if (data.usedModel) {
        setUsedModel(data.usedModel);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "시퀀스 생성 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        const { error } = await supabase.from("members").delete().eq("id", unwrappedParams.id);
        if (error) throw error;
        router.push("/");
        router.refresh();
      } catch (err: any) {
        alert(err.message || "삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl overflow-hidden flex items-center justify-center">
        <p className="text-gray-500 font-medium">회원 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium mb-4">회원을 찾을 수 없습니다.</p>
        <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full h-screen bg-white shadow-xl overflow-y-auto flex flex-col relative overflow-hidden">
      <header className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex flex-1 items-center gap-2">
          상세 정보
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => router.push(`/members/${unwrappedParams.id}/edit`)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <section className="p-6 bg-gray-50/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {member.name}
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {member.age_group} / {member.gender}
              </span>
            </h2>
            <div className="flex items-center gap-1 mt-1 text-sm font-medium text-indigo-700">
              <AlertCircle className="w-4 h-4" /> 잔여 {member.remaining_tickets}회
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="text-xs text-gray-500 mb-1">운동 목적</div>
             <div className="font-semibold text-gray-800">{member.goals.join(", ")}</div>
           </div>
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="text-xs text-gray-500 mb-1">체형 이슈</div>
             <div className="font-semibold text-gray-800">{member.posture_issues.join(", ")}</div>
           </div>
           <div className="col-span-2 bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm">
             <div className="text-xs text-red-500 mb-1">통증 부위</div>
             <div className="font-semibold text-red-800">{member.pain_points.join(", ")}</div>
           </div>
           {member.notes && (
             <div className="col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-100 shadow-sm">
               <div className="text-xs text-amber-600 mb-1">특이사항 (Memo)</div>
               <div className="font-medium text-amber-900 whitespace-pre-wrap leading-snug">{member.notes}</div>
             </div>
           )}
        </div>
      </section>

      <section className="p-6 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          오늘 수업 구성
        </h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사용 기구</label>
            <select
              value={apparatus}
              onChange={(e) => setApparatus(e.target.value)}
              className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="리포머">리포머</option>
              <option value="바렐">바렐</option>
              <option value="체어">체어</option>
              <option value="캐딜락">캐딜락</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">타겟 부위 (예: 둔근, 코어)</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="타겟 부위를 입력하세요"
              className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={generateSequence}
          disabled={generating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "AI가 시퀀스를 고민 중입니다..." : "AI 시퀀스 생성"}
        </button>
      </section>

      {(generating || sequence) && (
        <section className="p-6 border-t border-gray-100 bg-indigo-50/30 flex-1">
          {generating ? (
             <div className="flex flex-col items-center justify-center py-10">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
               <p className="text-sm font-medium text-indigo-800 animate-pulse">최적의 동작을 구성하고 있습니다...</p>
             </div>
          ) : (
            <div className="flex flex-col gap-3">
              {usedModel && (
                <div className="inline-flex items-center self-start gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full shadow-sm">
                  <Activity className="w-3.5 h-3.5" />
                  {getAccuracyLabel(usedModel)}
                </div>
              )}
              <div className="prose prose-sm max-w-none prose-indigo bg-white p-4 rounded-xl border border-indigo-100 shadow-sm leading-relaxed">
                <ReactMarkdown>{sequence}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
