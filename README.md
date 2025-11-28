# Fitness Planner - Frontend

A modern Single Page Application (SPA) built for tracking workouts, nutrition, and personal records. This project interacts with the Fitness Planner Backend via a RESTful API.

## 🛠 Tech Stack

- **Core:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS
- **State Management:** Redux Toolkit (RTK) & RTK Query
- **Runtime:** Bun

## ✨ Features

- **Authentication:** Secure login/signup via Supabase Auth (JWT).
- **Analytics:** Visual progress tracking and personal record calculation.
- **Templates:** Create and reuse workout structures.
- **Responsive:** Mobile-first design using TailwindCSS.

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.0 or higher) installed.

### Installation

**Clone the repository:**
```bash
git clone https://github.com/CS-E4400/fitness-planner-frontend.git
cd fitness-planner-frontend
```

**Install dependencies:**
```bash
bun install
```

**Create a .env file in the root directory:**
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1

VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Run Development Server:**
```bash
bun run dev
```

### 📦 Building for Production

**To create a production-ready build:**
```bash
bun run build
```

The output will be generated in the dist/ folder, ready for deployment on Vercel.

***
