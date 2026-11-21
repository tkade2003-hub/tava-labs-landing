// Shapes returned by the web-account edge function (serum repo,
// supabase/functions/web-account/index.ts). Mirrors the rows the mobile
// app reads: profiles (quiz answers + plan), orders, routine history.

export interface QuizAnswers {
  goal?: string;
  skinType?: string;
  concern?: string;
  sensitivity?: string;
  routine?: string;
  amTime?: string;
  pmTime?: string;
  source?: string;
}

export interface Plan {
  rampSchedule?: string;
  summary?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  morning_time: string | null;
  night_time: string | null;
  quiz_answers: QuizAnswers | null;
  plan: Plan | null;
  created_at: string;
}

export interface CustomerDetails {
  bottle_started_on: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  item: string;
  quantity: number;
  total: number | string;
  is_subscription: boolean;
  status: number; // 0 ordered, 1 shipped, 2 out for delivery, 3 delivered
  placed_at: string;
  payment_status: "unpaid" | "paid" | "failed";
  amount_total_cents: number | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  supliful_status: string | null;
  cancelled_at: string | null;
}

export interface RoutineSession {
  day: string; // yyyy-mm-dd
  session: string; // "morning" | "night"
}

export interface RoutineStepRow {
  day: string;
  step_id: string;
}

export interface Claim {
  code: string;
  expiresAt: string;
  orderNumber: string | null;
}

export interface WebAccountResponse {
  ok: boolean;
  email: string;
  hasAccount: boolean;
  profile: Profile | null;
  details: CustomerDetails | null;
  orders: Order[];
  routine_sessions: RoutineSession[];
  routine_steps: RoutineStepRow[];
  claims: Claim[];
}
