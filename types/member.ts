export interface Member {
  id: string;
  name: string;
  gender: string;
  age_group: string;
  goals: string[];
  posture_issues: string[];
  pain_points: string[];
  remaining_tickets: number;
  notes?: string;
}
