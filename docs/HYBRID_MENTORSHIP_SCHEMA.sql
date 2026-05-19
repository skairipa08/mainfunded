-- FundEd Hybrid Support + Mentorship Schema (PostgreSQL reference)

create type support_type as enum ('money', 'time', 'both');
create type session_status as enum ('scheduled', 'completed', 'cancelled');

create table mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name varchar(120) not null,
  expertise_areas text[] not null,
  industries text[] not null,
  sector varchar(80) not null,
  languages text[] not null,
  calendly_user_uri text,
  calcom_username varchar(50),
  accepting_new_students boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_profile_id uuid not null references mentor_profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  timezone varchar(80) not null
);

create table hybrid_support_intents (
  id uuid primary key default gen_random_uuid(),
  donor_user_id uuid not null,
  student_user_id uuid not null,
  support_mode support_type not null,
  donation_amount numeric(12,2) not null default 0,
  mentorship_hours numeric(6,2) not null default 0,
  career_goal text,
  preferred_language varchar(40),
  preferred_sector varchar(80),
  preferred_day_of_week smallint,
  status varchar(24) not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mentorship_matches (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null,
  mentor_profile_id uuid not null references mentor_profiles(id) on delete cascade,
  career_goal text not null,
  score smallint not null check (score between 0 and 100),
  reasons jsonb not null,
  created_at timestamptz not null default now()
);

create table mentorship_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null,
  student_user_id uuid not null,
  provider varchar(20) not null check (provider in ('calendly', 'calcom')),
  external_booking_id varchar(255) not null unique,
  external_event_id varchar(255),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  duration_minutes integer not null default 0,
  status session_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mentorship_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mentorship_sessions(id) on delete cascade,
  student_user_id uuid not null,
  mentor_user_id uuid not null,
  rating smallint not null check (rating between 1 and 5),
  goal_clarity smallint not null check (goal_clarity between 1 and 5),
  communication smallint not null check (communication between 1 and 5),
  helpfulness smallint not null check (helpfulness between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (session_id, student_user_id)
);

create table mentor_certificates (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null,
  year integer not null,
  total_hours numeric(8,2) not null,
  generated_at timestamptz not null default now(),
  unique (mentor_user_id, year)
);
