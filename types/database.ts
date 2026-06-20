// ============================================================
// types/database.ts
// CauseLoop — Full TypeScript types derived from Supabase schema
// ============================================================

// ---------- Enums ----------

export type UserRole      = "visitor" | "subscriber" | "admin";
export type PlanType      = "monthly" | "yearly";
export type SubStatus     = "active" | "inactive" | "cancelled" | "lapsed";
export type DrawType      = "three_match" | "four_match" | "five_match";
export type LogicType     = "random" | "algorithmic";
export type DrawStatus    = "draft" | "simulated" | "published";
export type VerifyStatus  = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid";
export type NotifStatus   = "sent" | "failed" | "pending";

// ---------- Row types (exact DB column shapes) ----------

export interface CharityRow {
  id:               string;
  name:             string;
  description:      string | null;
  image_urls:       string[];
  upcoming_events:  unknown[]; // JSONB array — cast to your event shape at call site
  is_featured:      boolean;
  created_at:       string;
  updated_at:       string;
}

export interface ProfileRow {
  id:                              string;
  role:                            UserRole;
  full_name:                       string | null;
  charity_id:                      string | null;
  charity_contribution_percentage: number;
  created_at:                      string;
  updated_at:                      string;
}

export interface SubscriptionRow {
  id:                     string;
  user_id:                string;
  plan_type:              PlanType;
  status:                 SubStatus;
  stripe_customer_id:     string | null;
  stripe_subscription_id: string | null;
  current_period_end:     string | null;
  renewal_date:           string | null;
  created_at:             string;
  updated_at:             string;
}

export interface ScoreRow {
  id:          string;
  user_id:     string;
  score_value: number;
  score_date:  string; // DATE returned as ISO string
  created_at:  string;
}

export interface DrawRow {
  id:                      string;
  month:                   number;
  year:                    number;
  draw_type:               DrawType;
  logic_type:              LogicType;
  status:                  DrawStatus;
  winning_numbers:         number[];
  prize_pool_amount:       string; // NUMERIC comes as string from PG
  jackpot_rollover_amount: string;
  created_at:              string;
  updated_at:              string;
}

export interface DrawEntryRow {
  id:             string;
  draw_id:        string;
  user_id:        string;
  numbers_played: number[];
  match_count:    number;
  prize_amount:   string;
  created_at:     string;
}

export interface WinnerRow {
  id:                  string;
  draw_id:             string;
  user_id:             string;
  proof_image_url:     string | null;
  verification_status: VerifyStatus;
  payment_status:      PaymentStatus;
  created_at:          string;
  updated_at:          string;
}

export interface NotificationLogRow {
  id:       string;
  user_id:  string;
  type:     string;
  sent_at:  string;
  status:   NotifStatus;
  metadata: Record<string, unknown>;
}

// ---------- Insert types (omit server-generated fields) ----------

export type InsertProfile = Pick<ProfileRow, "id"> &
  Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>;

export type InsertSubscription = Omit<SubscriptionRow, "id" | "created_at" | "updated_at">;
export type InsertScore        = Omit<ScoreRow, "id" | "created_at">;
export type InsertCharity      = Omit<CharityRow, "id" | "created_at" | "updated_at">;
export type InsertDraw         = Omit<DrawRow, "id" | "created_at" | "updated_at">;
export type InsertDrawEntry    = Omit<DrawEntryRow, "id" | "created_at">;
export type InsertWinner       = Omit<WinnerRow, "id" | "created_at" | "updated_at">;

// ---------- Supabase Database schema type (for createClient<Database>()) ----------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow;
        Insert: InsertProfile;
        Update: Partial<InsertProfile>;
      };
      charities: {
        Row:    CharityRow;
        Insert: InsertCharity;
        Update: Partial<InsertCharity>;
      };
      subscriptions: {
        Row:    SubscriptionRow;
        Insert: InsertSubscription;
        Update: Partial<InsertSubscription>;
      };
      scores: {
        Row:    ScoreRow;
        Insert: InsertScore;
        Update: Partial<InsertScore>;
      };
      draws: {
        Row:    DrawRow;
        Insert: InsertDraw;
        Update: Partial<InsertDraw>;
      };
      draw_entries: {
        Row:    DrawEntryRow;
        Insert: InsertDrawEntry;
        Update: Partial<InsertDrawEntry>;
      };
      winners: {
        Row:    WinnerRow;
        Insert: InsertWinner;
        Update: Partial<InsertWinner>;
      };
      notifications_log: {
        Row:    NotificationLogRow;
        Insert: Omit<NotificationLogRow, "id">;
        Update: Partial<Omit<NotificationLogRow, "id">>;
      };
    };
    Enums: {
      user_role:      UserRole;
      plan_type:      PlanType;
      sub_status:     SubStatus;
      draw_type:      DrawType;
      logic_type:     LogicType;
      draw_status:    DrawStatus;
      verify_status:  VerifyStatus;
      payment_status: PaymentStatus;
      notif_status:   NotifStatus;
    };
    Functions: {
      is_admin: {
        Args:    Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
