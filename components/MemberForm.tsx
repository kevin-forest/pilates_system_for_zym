"use client";

import React, { useState } from "react";
import { Member } from "@/types/member";

type FormMember = Partial<Member>;

interface MemberFormProps {
  initialData?: FormMember;
  onSubmit: (data: FormMember) => Promise<void>;
  onCancel: () => void;
}

export default function MemberForm({ initialData, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState<FormMember>({
    name: initialData?.name || "",
    gender: initialData?.gender || "여성",
    age_group: initialData?.age_group || "30대",
    goals: initialData?.goals || [],
    posture_issues: initialData?.posture_issues || [],
    pain_points: initialData?.pain_points || [],
    remaining_tickets: initialData?.remaining_tickets ?? 10,
    notes: initialData?.notes || "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Constants
  const GOALS_OPTIONS = ['체형교정', '다이어트', '코어 강화', '산전산후', '스포츠 컨디셔닝'];
  const POSTURE_OPTIONS = ['거북목', '라운드숄더', '골반 전방경사', '골반 후방경사', '척추측만', '휜다리'];
  const PAIN_OPTIONS = ['목', '어깨', '허리', '무릎', '손목', '발목', '특이사항 없음'];

  const handleCheckboxChange = (field: keyof FormMember, value: string) => {
    setFormData((prev) => {
      const list = prev[field] as string[];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white flex-1 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
          <input type="text" className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="홍길동" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">잔여 수강권</label>
          <input type="number" className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={formData.remaining_tickets} onChange={e => setFormData({...formData, remaining_tickets: parseInt(e.target.value) || 0})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">특이사항 (Memo)</label>
          <textarea className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow min-h-[100px]" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="신규 질환 및 특이사항 등..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
          <select className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
            <option value="여성">여성</option>
            <option value="남성">남성</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
          <select className="w-full border-gray-200 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formData.age_group} onChange={e => setFormData({...formData, age_group: e.target.value})}>
            <option value="20대">20대</option>
            <option value="30대">30대</option>
            <option value="40대">40대</option>
            <option value="50대 이상">50대 이상</option>
          </select>
        </div>
      </div>

      <div className="space-y-5 border-t border-gray-100 pt-5">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">운동 목적</label>
          <div className="flex flex-wrap gap-2">
            {GOALS_OPTIONS.map(opt => (
              <label key={opt} className={`px-3 py-1.5 rounded-full border text-sm flex items-center cursor-pointer transition-colors ${(formData.goals as string[]).includes(opt) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>
                <input type="checkbox" className="hidden" checked={(formData.goals as string[]).includes(opt)} onChange={() => handleCheckboxChange('goals', opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">체형 불균형</label>
          <div className="flex flex-wrap gap-2">
            {POSTURE_OPTIONS.map(opt => (
              <label key={opt} className={`px-3 py-1.5 rounded-full border text-sm flex items-center cursor-pointer transition-colors ${(formData.posture_issues as string[]).includes(opt) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>
                <input type="checkbox" className="hidden" checked={(formData.posture_issues as string[]).includes(opt)} onChange={() => handleCheckboxChange('posture_issues', opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">통증 부위</label>
          <div className="flex flex-wrap gap-2">
            {PAIN_OPTIONS.map(opt => (
              <label key={opt} className={`px-3 py-1.5 rounded-full border text-sm flex items-center cursor-pointer transition-colors ${(formData.pain_points as string[]).includes(opt) ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>
                <input type="checkbox" className="hidden" checked={(formData.pain_points as string[]).includes(opt)} onChange={() => handleCheckboxChange('pain_points', opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 pb-10">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors">
          취소
        </button>
        <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:opacity-50">
          {submitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
}
