-- Migration: Create workout_plans table and seed initial plan
-- Defines template and user-authored workout plans with structured JSON definitions

-- Ensure helper function exists for updated_at management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  duration_weeks INTEGER CHECK (duration_weeks > 0),
  definition JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);

CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed a 16-week Spring Ultimate Athlete plan as a reusable template
INSERT INTO public.workout_plans (user_id, name, goal, duration_weeks, definition)
SELECT
  NULL AS user_id,
  'Spring Ultimate Athlete' AS name,
  'Build balanced strength, speed, and conditioning over 16 weeks leading into summer.' AS goal,
  16 AS duration_weeks,
  '{
    "season": "Spring",
    "title": "Spring Ultimate Athlete",
    "summary": "16-week progression blending strength, sprint work, and conditioning for field sport performance.",
    "phases": [
      {"name": "Foundation", "weeks": [1, 2, 3, 4], "focus": "Movement quality, aerobic base, controlled strength"},
      {"name": "Strength", "weeks": [5, 6, 7, 8], "focus": "Heavy bilateral lifts, linear speed technique, tempo runs"},
      {"name": "Power", "weeks": [9, 10, 11, 12], "focus": "Explosive lifts, jumps, change-of-direction, repeat sprint ability"},
      {"name": "Peak & Deload", "weeks": [13, 14, 15, 16], "focus": "Speed maintenance, sharpness, reduced volume"}
    ],
    "weekly_structure": [
      {"day": "Mon", "theme": "Heavy Lower + Acceleration", "notes": "Squat pattern + 10-30m starts"},
      {"day": "Tue", "theme": "Upper Push/Pull Strength", "notes": "Press/row pairing with rotator cuff"},
      {"day": "Wed", "theme": "Tempo Conditioning", "notes": "8-12 x 100-150m @ 70% with walk-back"},
      {"day": "Thu", "theme": "Power + Agility", "notes": "Oly variants, jumps, change-of-direction"},
      {"day": "Sat", "theme": "Small-Sided Games or Intervals", "notes": "Match-speed touches or 30s on/30s off x 12"}
    ],
    "weeks": [
      {"week": 1, "focus": "Foundation", "sessions": [
        {"type": "Strength", "details": "Back squat 3x6 @ RPE7, RDL 3x8, split squat 3x8, core carries"},
        {"type": "Speed", "details": "6 x 20m build-ups, A-march/skip, wicket runs"},
        {"type": "Conditioning", "details": "8 x 100m tempo runs @ 70% with walk-back"}
      ]},
      {"week": 4, "focus": "Foundation", "sessions": [
        {"type": "Strength", "details": "Front squat 4x5, hip thrust 4x8, lateral lunge 3x10, Copenhagen plank"},
        {"type": "Speed", "details": "4 x 30m accelerations, medball scoop throws 3x6"},
        {"type": "Conditioning", "details": "10 x 120m tempo @ 70%"}
      ]},
      {"week": 8, "focus": "Strength", "sessions": [
        {"type": "Strength", "details": "Back squat 5x3 @ 85%, hex bar deadlift 4x4, single-leg RDL 3x6"},
        {"type": "Speed", "details": "6 x 20m sled pushes (light), wall drills"},
        {"type": "Conditioning", "details": "Bike tempo 12 x 40s @ 120-130 bpm"}
      ]},
      {"week": 12, "focus": "Power", "sessions": [
        {"type": "Power", "details": "Hang power clean 5x3, jump squats 4x5 @ 25% bodyweight, broad jumps 4x3"},
        {"type": "Agility", "details": "Pro-agility shuttle 6x, 45° cuts 3x5/side"},
        {"type": "Conditioning", "details": "6 x 150m shuttles @ 80% with 2:1 rest"}
      ]},
      {"week": 16, "focus": "Peak & Deload", "sessions": [
        {"type": "Power", "details": "Trap bar jump 3x3 @ 20% bodyweight, medball rotational throws 3x6/side"},
        {"type": "Speed", "details": "3 x 30m accelerations, flying 20s x 3"},
        {"type": "Conditioning", "details": "6 x 30s on/30s off rower @ RPE7"}
      ]}
    ],
    "equipment": ["barbell", "dumbbells", "trap bar", "medball", "sled", "bike/rower"],
    "notes": "Keep 1-2 reps in reserve on strength work. Prioritize crisp mechanics on sprint sessions."
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.workout_plans WHERE name = 'Spring Ultimate Athlete'
);
