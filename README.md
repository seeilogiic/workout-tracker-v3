# Workout Tracker (Third Try)

A personal workout tracking web app built with React + TypeScript + Vite and Supabase.

## Features

- Log workouts by type (Push, Pull, Legs)
- Track exercises with sets, reps, weight, equipment, and notes
- View workout history
- Mobile-friendly dark minimalist design
- Works offline with localStorage caching for exercise names
- Graceful error handling when Supabase is unavailable

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend/Database**: Supabase
- **Routing**: React Router
- **Deployment**: GitHub Pages

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase (Optional)

The app will work even without Supabase configured, but you'll see an error message. To set up Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Create the following tables in Supabase:

**workouts** table:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `date` (date, not null)
- `type` (text, not null) - 'Push', 'Pull', or 'Legs'
- `created_at` (timestamp, default: `now()`)
- `updated_at` (timestamp, default: `now()`)

**exercises** table:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `workout_id` (uuid, foreign key to workouts.id, on delete cascade)
- `exercise_name` (text, not null)
- `sets` (integer, not null)
- `reps` (integer, not null)
- `weight` (numeric, not null)
- `equipment` (text, nullable) - 'machine', 'dumbbell', 'bar', 'cable', 'bodyweight', 'other'
- `notes` (text, nullable)
- `created_at` (timestamp, default: `now()`)

**workout_plans** table:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `user_id` (uuid, foreign key to `auth.users.id`, nullable for global templates)
- `name` (text, not null)
- `goal` (text, nullable)
- `duration_weeks` (integer, check > 0)
- `definition` (jsonb, not null) - structured plan content
- `created_at` (timestamp, default: `now()`)
- `updated_at` (timestamp, default: `now()`)

4. (Optional) Configure Row Level Security (RLS):
   - For a single-user app, you can disable RLS on both tables
   - Or create policies to allow all operations for authenticated users

### 3. Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to GitHub Pages

The app is configured for automatic deployment via GitHub Actions. The base path in `vite.config.ts` is already set to `/workout-tracker-v3/` to match the repository name.

#### Automatic Deployment (Recommended)

1. Push your code to the `main` branch on GitHub
2. The GitHub Actions workflow will automatically build and deploy your app
3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
4. Your app will be available at `https://seeilogiic.github.io/workout-tracker-v3/`

#### Manual Deployment (Alternative)

If you prefer manual deployment:

1. Ensure `vite.config.ts` base path matches your repository name:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/workout-tracker-v3/' : '/',
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Configure GitHub Pages in repository settings to use the `gh-pages` branch

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Dashboard, LogWorkout, History)
├── context/        # React Context for state management
├── lib/            # Utility functions and Supabase client
├── hooks/          # Custom React hooks
└── types/          # TypeScript type definitions
```

## Usage

1. **Start a Workout**: Click "Start New Workout" and select Push, Pull, or Legs
2. **Add Exercises**: Fill in exercise details (name, sets, reps, weight, equipment, notes)
3. **Save Workout**: Click "Save Workout" to persist to Supabase
4. **View History**: Navigate to History page to see all past workouts

## Error Handling

The app gracefully handles Supabase connection errors:
- If Supabase keys are missing or invalid, the app will display "Could not contact Supabase"
- The app remains functional and navigable even without Supabase
- Exercise names are cached in localStorage for offline autofill

## Future Enhancements

- Calendar view for weekly/monthly navigation
- Progress charts and statistics
- Weight progression tracking
- AI summaries or recommendations
