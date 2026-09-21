# EXMELLO — Product Requirements Document (PRD) & Specifications
**Document Version:** 1.0.0  
**Status:** Approved / Single Source of Truth (SSOT)  
**Target Platform:** Responsive Web Application (Mobile-First)  
**Author / Role:** Product Manager + UX/Requirements Analyst  

---

## 1. Project Overview

### 1.1 Brand Identity & Name Origin
* **Product Name:** EXMELLO
* **Etymology:** **Exam** + **Mellow**
* **Tagline:** *Breathe through exam season. Micro-resets and calm focus in seconds.*

### 1.2 Mission & Concept
EXMELLO is a student-focused web application engineered to help university students manage exam-season cognitive overload, diffuse acute stress, regain actionable focus, and take meaningful short breaks. 

Unlike conventional productivity apps that induce guilt through rigid streaks and overflowing task backlogs, or generic meditation apps with lengthy audio lectures, EXMELLO centers entirely on rapid, low-friction relief:

$$\text{Check In} \longrightarrow \text{Understand Need} \longrightarrow \text{Get Prescription} \longrightarrow \text{Take Action}$$

The entire interaction is designed to demand near-zero cognitive overhead from an already depleted student.

### 1.3 Target Audience
* **Primary:** Undergraduate and graduate university students undergoing midterm/final exam periods, project crunches, and thesis deadlines.
* **Secondary:** High school seniors preparing for standardized university entrance exams.
* **Persona Archetypes:**
  1. *The Overwhelmed Crammer:* Has 12 hours before an exam, paralyzed by how much material remains, heart racing.
  2. *The Exhausted Zombie:* Functioning on 3 hours of sleep, eyes burning, unable to absorb another sentence.
  3. *The Restless Distracted:* Sitting at a library desk for 4 hours, constantly checking phone/tabs, unable to initiate study flow.

### 1.4 Clinical & Legal Boundaries
> **CRITICAL DISCLAIMER:**  
> EXMELLO is strictly a **wellness, cognitive pacing, and productivity support tool**. It is **NOT** a medical, psychological, or clinical application. It does not provide diagnoses, psychiatric triage, clinical therapy, or medical advice. Explicit emergency crisis resources are made readily available without gatekeeping.

---

## 2. Product Goals & Principles

### 2.1 Core Problem Statement
During exam season, university students experience acute cognitive fatigue, decision paralysis, and heightened stress. When students feel overwhelmed, existing digital tools fail them:
* **Productivity apps** (Notion, Todoist, Forest) require planning, tagging, and high cognitive overhead to set up.
* **Meditation apps** (Headspace, Calm) require 10–20 minute passive commitments that students feel they "don't have time for" while cramming.
* Students remain trapped in an unproductive state: doom-scrolling, staring blankly at lecture notes, or panicking.

### 2.2 Core Value Proposition
**Immediate, zero-friction cognitive relief and targeted focus resets delivered in under 20 seconds.**

### 2.3 Cardinal UX Principle
> **"The user should do very little. EXMELLO should do most of the work."**

* **Zero Typing Required:** Core flow relies on single-tap chips and visual cards.
* **Total Time to Recommendation:** Between **10 and 20 seconds**.
* **Zero Barrier to Entry:** Full access to core check-in, recommendation, focus timer, and breathing exercises without mandatory registration.

### 2.4 Product Goals
1. **Pave the Shortest Path to Relief:** Guide a panicked student from site opening to an active reset or focus state within 30 seconds.
2. **De-escalate Exam Panic:** Lower perceived stress levels immediately through science-backed micro-interventions (box breathing, physiological sigh, time-boxing).
3. **Encourage Sustainable Study Cycles:** Validate taking breaks as an active academic strategy rather than lost study time.
4. **Portfolio-Grade Architectural Excellence:** Maintain clean modularity across frontend, backend, and database layers for production-grade reliability.

### 2.5 Non-Goals
* **No Social Feeds / Community Forums:** Prevents peer comparison, cyberbullying, and FOMO.
* **No Complex Analytics / Guilt Dashboards:** No "failed streak" red badges or shaming notifications.
* **No Medical / Diagnostic Questionnaires:** No PHQ-9, GAD-7, or psychological scoring.
* **No Generative AI Chatbots in V1:** Rule-based determinism ensures instant, predictable, and medically safe responses.
* **No Flashcard / LMS Replacement:** EXMELLO regulates *state of mind*, not textbook content.

### 2.6 Success Criteria & Key Performance Indicators (KPIs)
* **Time-to-Action (TTA):** Median time from landing on `/checkin` to activating an action is $\le 20\text{ seconds}$.
* **Check-in Completion Rate:** $\ge 85\%$ of started check-ins reach a recommendation.
* **Session Completion Rate:** $\ge 65\%$ of triggered Focus or Breathing sessions run to timer completion.
* **Perceived Mood Shift:** Qualitative sentiment showing a de-escalation of acute panic post-session.

---

## 3. Core User Journey

```
┌────────────────────────────────────────────────────────┐
│                      Open EXMELLO                      │
│        (Clean, welcoming landing page with direct CTA) │
└───────────────────────────┬────────────────────────────┘
                            │ Tap "Quick Check-in"
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Step 1: Choose Mood                  │
│       5 Visual Emoji Cards (1 tap) [Required]          │
└───────────────────────────┬────────────────────────────┘
                            │ Auto-advances / Next
                            ▼
┌────────────────────────────────────────────────────────┐
│              Step 2: What's Bothering You?             │
│       7 Context Chips + "Other" (1 tap) [Required]     │
└───────────────────────────┬────────────────────────────┘
                            │ Auto-advances / Next
                            ▼
┌────────────────────────────────────────────────────────┐
│           Step 3: What Do You Need Right Now?          │
│       4 Goal Chips [Optional - default auto-inferred]   │
└───────────────────────────┬────────────────────────────┘
                            │ Tap "Show Recommendation"
                            ▼
┌────────────────────────────────────────────────────────┐
│               System Recommendation Screen             │
│  - Empathetic Micro-Copy                               │
│  - 1 Primary Prescribed Action (e.g., "Start Focus")   │
│  - 2 Secondary / Alternative Options                   │
└───────────────────────────┬────────────────────────────┘
                            │ Single tap execution
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Action Active                     │
│  [Focus Timer] or [Breathing Exercise] or [Micro-Reset] │
└───────────────────────────┬────────────────────────────┘
                            │ Timer completes or user exits
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Completion State                   │
│   Gentle validation + option to return or log history  │
└────────────────────────────────────────────────────────┘
```

### Detailed Journey Steps:
1. **Open EXMELLO (`/`):** User lands on a calm, soft-toned screen. A primary button (`Quick Check-in`) is visible above the fold.
2. **Quick Check-in (`/checkin`):** 
   * **Step 1 (Mood):** User selects 1 of 5 moods (e.g., `😰 Overwhelmed`). UI smoothly slides forward.
   * **Step 2 (Concern):** User selects 1 of 7 concerns (e.g., `⏰ Running out of time`).
   * **Step 3 (Optional Need):** User can pick a desired outcome or tap "Skip / Recommend for me".
3. **Recommendation Result (`/recommendation`):** System renders an immediate, personalized card displaying empathetic, non-judgmental copy, one prominent Primary Action button, and two smaller alternative links.
4. **Active Intervention:** One tap launches the designated tool (Distraction-free 25-minute Pomodoro, 2–3 min Box Breathing, or a 1-minute somatic physical reset).
5. **Session Wrap-up:** Reassuring completion toast/screen congratulating the student on prioritizing their cognitive health.

---

## 4. Mood System Specification

The mood system captures the student's affective state in 1 tap. It operates strictly on self-reported emotion without diagnostic scoring.

| Emoji & Label | Emotional State Definition | UI Presentation | Primary Recommendation Direction | Edge Cases & Safety Handling |
| :--- | :--- | :--- | :--- | :--- |
| **😄 Great** | High energy, positive outlook, feeling capable and ahead. | Warm green/emerald accent, soft lift animation. | Deep Work Focus (25m or 50m Pomodoro), Exam simulation. | Ensure user doesn't burn out through excessive cramming. |
| **🙂 Good** | Stable, grounded, moderate motivation, ready to study. | Teal/cyan calm accent. | Standard Focus Block (25m), Structured material review. | Standard baseline. |
| **😐 Okay** | Low-to-neutral energy, slight brain fog, drifting focus. | Soft slate/amber hue. | Gentle Warm-up Session (15m), Stretch + hydration reset. | Distinguish between sleepiness vs boredom. |
| **😟 Stressed** | Muscle tension, time anxiety, fear of failure, racing thoughts. | Warm coral/terracotta hue. | 3-minute Calming Breath, Task deconstruction (Micro-step focus). | Offer gentle reassurance; emphasize small single steps. |
| **😰 Overwhelmed** | Freeze response, feeling paralyzed, panic, sensory overload. | Soft rose/lavender hue (deliberately desaturated). | 2-minute Grounding / Box Breathing, Immediate 5m Break. | Always display non-intrusive link to "Need someone to talk to? (Crisis support)". |

---

## 5. Concern / Problem Selection Specification

The user selects the single most pressing bottleneck currently obstructing their work.

1. **📚 Can't finish studying**  
   * *Meaning:* Immense syllabus volume; paralysis due to perceived scale.  
   * *Recommendation Focus:* Micro-slicing tasks; 25-minute single-subtopic sprints.
2. **🧠 Can't remember**  
   * *Meaning:* Retroactive interference or memory exhaustion from continuous rote memorization.  
   * *Recommendation Focus:* Short cognitive rest, active recall spacing, hydration micro-break.
3. **⏰ Running out of time**  
   * *Meaning:* Acute deadline urgency; panic-induced time distortion.  
   * *Recommendation Focus:* 15-minute triage focus; eliminating all low-yield topics.
4. **😴 Didn't sleep enough**  
   * *Meaning:* Physical lethargy, adenosine buildup, heavy eyelids.  
   * *Recommendation Focus:* 5-minute somatic stretch/water reset, non-sleep deep rest (NSDR), light focus.
5. **😰 Worried about exam**  
   * *Meaning:* Anticipatory test anxiety, catastrophizing outcomes.  
   * *Recommendation Focus:* 3-minute physiological sigh breathing, grounding exercise, cognitive reframe resource.
6. **💭 Can't stop thinking**  
   * *Meaning:* Cognitive chatter, mental loops, intrusive worry thoughts.  
   * *Recommendation Focus:* 3-minute box breathing, 2-minute brain dump prompt.
7. **😵 Feeling exhausted**  
   * *Meaning:* Complete burnout, nervous system depletion.  
   * *Recommendation Focus:* Immediate step away from the desk, eyes-closed reset, restorative tea break.
8. **✨ Other (Optional)**  
   * *Meaning:* Unlisted issue. Triggers balanced default reset (Calm Grounding + 15m Focus).

---

## 6. Optional Need Selection

Users may optionally declare their immediate goal:
* **🎯 Focus** — "I need to get words on paper or read chapters right now."
* **🌱 Calm down** — "My heart is racing, I need to stabilize my nervous system."
* **☕ Take a break** — "I need permission to stop without feeling guilty."
* **💪 Get motivated** — "I am staring at my screen unable to begin."

### UX Friction Requirement:
* **Input Status:** **OPTIONAL**.
* **Rationale:** When students are stressed, presenting three mandatory questions increases abandonment. If the user leaves this unselected, the Recommendation Engine automatically infers the need based on the chosen `Mood` and `Concern`.

---

## 7. Recommendation Engine (Rule-Based Matrix)

The engine evaluates input parameters through a deterministic rule evaluation matrix. No machine learning or external LLM API latency is introduced.

### 7.1 Rule Evaluation Priority
1. **Direct Need Match:** If user explicitly selected an `Optional Need`, weight the primary action toward that need while tinting the copy with the `Mood` and `Concern`.
2. **Inferred Match:** If `Need` is blank, evaluate the combined tuple: `(Mood, Concern)`.
3. **Default Fallback:** Any unrecognized or sparse state resolves to: *Warm Reassurance Copy + 2-Minute Breathing Exercise + 25-Minute Focus Option*.

### 7.2 Decision Table

| Rule ID | Mood Condition | Concern Condition | Need (If Specified) | Empathetic Message Copy | Primary Action (CTA) | Secondary Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | 😰 Overwhelmed | Any | Any / Calm down | *"Let's pause the world for three minutes. The syllabus can wait while you catch your breath."* | **Start 3-Min Breathing** | 1-Min Water Reset |
| **R-02** | 😟 Stressed | ⏰ Running out of time | Any / Focus | *"Panicking steals time; focus buys it back. Let's tackle just one single problem for 15 minutes."* | **Start 15-Min Focus** | Quick Reset (Breathe) |
| **R-03** | 😟 Stressed | 📚 Can't finish studying | Any / Focus | *"You don't need to finish everything right now. You only need to finish the next 25 minutes."* | **Start 25-Min Focus** | 3-Min Reset |
| **R-04** | 😟 Stressed | 😰 Worried about exam | Any / Calm down | *"Your mind is preparing for a challenge, but you are in control. Let's regulate your pulse."* | **Start Breathing (Box)** | Read "Exam Morning Reset" |
| **R-05** | Any | 😴 Didn't sleep enough | Any / Take a break | *"A tired brain cannot store memory. Step away, drink a tall glass of water, and stretch."* | **Take 5-Min Reset** | Read "Sleep vs All-Nighter" |
| **R-06** | Any | 😵 Feeling exhausted | Any / Take a break | *"Pushing through exhaustion yields diminishing returns. Take a restorative break guilt-free."* | **Start Quick Reset** | 3-Min Gentle Breathing |
| **R-07** | Any | 💭 Can't stop thinking | Any / Calm down | *"Your thoughts are racing ahead of reality. Let's bring your attention back to your body."* | **Start 3-Min Breathing** | 25-Min Focus |
| **R-08** | Any | 🧠 Can't remember | Any / Focus | *"Memory blocks happen when cortisol spikes. Lower your heart rate, then test yourself in short bursts."* | **Start 2-Min Reset** | 25-Min Focus |
| **R-09** | 🙂 Good / 😄 Great | 📚 Can't finish studying | Any / Focus | *"You have good energy today. Let's harness it into a solid, distraction-free study block."* | **Start 25-Min Focus** | 50-Min Deep Work |
| **R-10** | 😐 Okay | Any | 💪 Get motivated | *"Starting is the hardest part. Just commit to 10 minutes—if you want to stop after, you can."* | **Start 10-Min Focus** | 1-Min Stretch |
| **R-FALLBACK**| Any | Any | Any | *"One step at a time. Take a deep breath and start small."* | **Start 25-Min Focus** | 3-Min Breathing |

---

## 8. Core Feature Specifications

### 8.1 Home (`/`)
* **Hero Section:** 
  * Headline: *"Breathe through exam season."*
  * Sub-headline: *"Feeling overwhelmed, tired, or stuck? Check in for 15 seconds to get an instant study reset."*
  * Primary CTA: Large interactive button: `Start Quick Check-in →` (leads to `/checkin`).
  * Micro-badge: *"No sign-up required • 100% free • University wellness tool"*.
* **How It Works (3 Steps):**
  1. *Check In:* Select your mood and what's bothering you (15 sec).
  2. *Get Matched:* Receive a tailored micro-action based on cognitive science.
  3. *Regain Control:* Do a focused study sprint, a guided breath, or a reset.
* **Interactive Preview:** Visual preview card demonstrating the check-in modal.
* **Resources Preview:** Grid of 3 featured student guides (e.g., *"How to stop catastrophizing grades"*).
* **Urgent Help Section:** Distinct banner with standard university counseling and crisis helpline info.
* **Footer:** Privacy statement, Non-medical disclaimer, GitHub repository link, Copyright.

### 8.2 Quick Check-in Flow (`/checkin`)
* **Step-based Micro-Form:**
  * Clean progress indicator (`Step 1 of 3`).
  * Keyboard accessible (numbers 1–5 or arrow navigation).
  * Auto-transition on selection option with an explicit "Back" button.
* **Step 1:** Select Mood (5 visual cards with distinct emoji and comforting color borders).
* **Step 2:** Select Concern (7 selectable chip buttons + 1 "Other").
* **Step 3:** Optional Need (4 chips + "Skip / See Recommendation").
* **Validation:** Primary button becomes active as soon as mandatory items are selected. Smooth Framer Motion transitions between steps.

### 8.3 Recommendation Screen (`/recommendation`)
* **Empathetic Card:** High-contrast, gentle card container featuring:
  * Personalized reassurance header based on mood.
  * Prescribed Action Badge: e.g., `Recommended: Focus Sprint (25m)`.
  * Rationale paragraph (2 lines maximum).
* **Action CTAs:**
  * **Primary Button:** High visual weight (`Start 25-Minute Focus →` or `Begin 3-Minute Breathing →`).
  * **Secondary Options:** Subdued outline buttons (`Try Quick Reset instead`, `Explore Study Guides`).

### 8.4 Focus Timer (`/focus`)
* **Default Duration:** 25 minutes (Pomodoro standard). Configurable presets for 15m, 25m, and 50m.
* **Interface Controls:**
  * Prominent circular time display (`25:00`).
  * Action triggers: `Start`, `Pause`, `Resume`, `Reset`.
  * Exit button with confirmation modal (`"Are you sure you want to end early?"`).
* **Distraction-Free Mode:** Hides global navigation and unnecessary UI chrome when the timer is active.
* **Completion State:** Soft audio chime (optional/mutable) + gentle visual celebration banner + "Take a 5-minute break" prompt.

### 8.5 Breathing Exercise (`/breathing`)
* **Exercise Types:**
  * **Box Breathing:** 4s Inhale $\rightarrow$ 4s Hold $\rightarrow$ 4s Exhale $\rightarrow$ 4s Hold.
  * **Physiological Sigh (De-stress):** Two quick inhales through nose $\rightarrow$ long exhale through mouth.
* **Visual Representation:** Smoothly expanding and contracting SVG circle with real-time text prompt (`Inhale`, `Hold`, `Exhale`).
* **Session Controls:** Cycle counter (e.g., `Cycle 2 of 4`), `Start`, `Pause`, `Mute Audio`, `Exit`.
* **Clinical Boundary:** Tagged clearly as *"Nervous system down-regulation exercise (Non-medical)"*.

### 8.6 Quick Reset (`/reset`)
* Zero-input interactive cards guiding 60- to 180-second physical/cognitive resets:
  1. **The 60-Second Eye Rest:** 20-20-20 rule guide (look 20 feet away for 20 seconds).
  2. **The Hydration & Posture Reset:** Prompt to drink a glass of water and roll shoulders.
  3. **The 2-Minute Desk Stretch:** 3 gentle seated stretches for neck, spine, and wrists.
  4. **The Mental Brain Dump:** A blank local scratchpad with an instant `Clear / Burn` button to release anxious thoughts.

### 8.7 Resource Library (`/resources`)
* **Categories:** `All`, `Study Tactics`, `Stress & Panic`, `Sleep & Energy`, `Exam Day Routines`.
* **Article Format:**
  * Title, category badge, estimated reading time (e.g., `2 min read`).
  * Punchy, bullet-pointed, actionable summaries (no walls of academic prose).
* **Get Help Section:** Static, prominent emergency assistance contact numbers and university student support links.

### 8.8 Personal Dashboard (`/dashboard`)
* **Lightweight Philosophy:** Designed to support, not track obsessively.
* **Dashboard Widgets:**
  * *Last Check-in Summary:* Mood + Concern logged from last session.
  * *Recent Activity Feed:* Simple list of completed focus blocks and breathing exercises.
  * *Total Mindful Study Minutes:* Single clean metric counter.
* **Explicit Exclusion:** No streak counters that break, no red warning dots, no comparative leaderboards.

---

## 9. Authentication & User Model

### 9.1 Frictionless MVP Architecture
* **Guest First (Unauthenticated):** All core tools (`/checkin`, `/recommendation`, `/focus`, `/breathing`, `/resources`) are 100% operational in guest mode using browser `localStorage`.
* **Account Value Proposition:** Account creation is purely optional to enable cross-device synchronization and permanent activity history.

### 9.2 Authentication Flows
* **Sign Up:** Email, Password, Name (optional).
* **Login:** Email, Password $\rightarrow$ Issues HTTP-only Secure JWT Cookie / Bearer Token.
* **Logout:** Clears token/session state.
* **Session Strategy:** Stateless JWT with 7-day expiration.

---

## 10. Data Requirements & Schema

Minimalist, GDPR-compliant relational design.

```
┌──────────────────┐       1:N       ┌──────────────────┐
│      users       ├─────────────────┤     checkins     │
└────────┬─────────┘                 └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐                 ┌──────────────────┐
│  focus_sessions  │                 │    resources     │
└──────────────────┘                 └──────────────────┘
```

### 10.1 Entity Definitions

#### 1. `users`
* `id`: UUID (Primary Key, default `gen_random_uuid()`)
* `email`: VARCHAR(255) (Unique, Indexed, Non-null)
* `hashed_password`: VARCHAR(255) (Non-null)
* `full_name`: VARCHAR(100) (Nullable)
* `created_at`: TIMESTAMPTZ (Default `NOW()`)
* `updated_at`: TIMESTAMPTZ (Default `NOW()`)

#### 2. `checkins`
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE, Nullable for guest sync)
* `mood`: VARCHAR(30) (Check constraint: `great`, `good`, `okay`, `stressed`, `overwhelmed`)
* `concern`: VARCHAR(50) (Non-null)
* `need`: VARCHAR(50) (Nullable)
* `created_at`: TIMESTAMPTZ (Default `NOW()`)

#### 3. `focus_sessions`
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE, Nullable)
* `duration_minutes`: INTEGER (Non-null, default `25`)
* `completed`: BOOLEAN (Default `FALSE`)
* `session_type`: VARCHAR(30) (Default `'focus'`, options: `'focus'`, `'breathing'`, `'reset'`)
* `created_at`: TIMESTAMPTZ (Default `NOW()`)

#### 4. `resources`
* `id`: VARCHAR(100) (Primary Key, e.g. `'stop-exam-panic'`)
* `title`: VARCHAR(200) (Non-null)
* `category`: VARCHAR(50) (Indexed, Non-null)
* `summary`: TEXT (Non-null)
* `content_markdown`: TEXT (Non-null)
* `reading_time_minutes`: INTEGER (Default `2`)
* `created_at`: TIMESTAMPTZ (Default `NOW()`)

#### 5. `recommendation_rules` (In-Memory / Static DB Seed)
* `id`: VARCHAR(50) (Primary Key)
* `mood`: VARCHAR(30)
* `concern`: VARCHAR(50)
* `need`: VARCHAR(50)
* `headline`: VARCHAR(255)
* `message`: TEXT
* `primary_action`: VARCHAR(50)
* `secondary_action`: VARCHAR(50)

---

## 11. API Requirements & REST Endpoints

All APIs adhere to standard REST semantics, accepting and returning JSON (`application/json`).

### 11.1 Authentication Endpoints
* **`POST /api/v1/auth/register`**
  * *Purpose:* Register a new user account.
  * *Request:* `{ "email": "student@univ.edu", "password": "SecurePassword123", "full_name": "Alex" }`
  * *Response (201):* `{ "user": { "id": "uuid", "email": "...", "full_name": "..." }, "token": "jwt_token" }`
  * *Errors:* `400 Bad Request` (Validation), `409 Conflict` (Email already registered).
* **`POST /api/v1/auth/login`**
  * *Purpose:* Authenticate and receive JWT.
  * *Request:* `{ "email": "student@univ.edu", "password": "SecurePassword123" }`
  * *Response (200):* `{ "user": { ... }, "token": "jwt_token" }`
  * *Errors:* `401 Unauthorized`.
* **`GET /api/v1/auth/me`**
  * *Purpose:* Get current user profile. Auth required.
  * *Response (200):* `{ "id": "uuid", "email": "...", "full_name": "..." }`

### 11.2 Check-in & Recommendation Endpoints
* **`POST /api/v1/checkins`**
  * *Purpose:* Submit a completed quick check-in.
  * *Auth:* Optional (bearer token if logged in; anonymous allowed).
  * *Request:* `{ "mood": "stressed", "concern": "running_out_of_time", "need": "focus" }`
  * *Response (201):* 
    ```json
    {
      "checkin_id": "uuid",
      "recommendation": {
        "headline": "Panicking steals time; focus buys it back.",
        "message": "Let's tackle just one single problem for 15 minutes.",
        "primary_action": { "type": "focus", "duration": 15, "label": "Start 15-Min Focus" },
        "secondary_action": { "type": "breathing", "duration": 3, "label": "Take 3-Min Breath" }
      }
    }
    ```
* **`GET /api/v1/checkins/recent`**
  * *Purpose:* Fetch user's recent check-in history. Auth required.
  * *Response (200):* `[ { "id": "uuid", "mood": "stressed", "created_at": "..." } ]`

### 11.3 Focus & Activity Endpoints
* **`POST /api/v1/focus/sessions`**
  * *Purpose:* Log a completed or aborted session.
  * *Auth:* Optional.
  * *Request:* `{ "duration_minutes": 25, "completed": true, "session_type": "focus" }`
  * *Response (201):* `{ "status": "recorded", "session_id": "uuid" }`

### 11.4 Resources Endpoints
* **`GET /api/v1/resources`**
  * *Purpose:* List articles with category filtering.
  * *Query Params:* `?category=stress`
  * *Response (200):* `[ { "id": "stop-panic", "title": "...", "category": "stress", "reading_time": 2 } ]`
* **`GET /api/v1/resources/{id}`**
  * *Purpose:* Retrieve full markdown content of a resource.
  * *Response (200):* `{ "id": "stop-panic", "title": "...", "content_markdown": "# Stop Panic..." }`
  * *Errors:* `404 Not Found`.

---

## 12. Recommended Tech Stack & Justification

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND: Next.js                        │
│   React 19 • TypeScript • Tailwind CSS • Framer Motion      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND: FastAPI                         │
│             Python 3.11+ • Pydantic • SQLAlchemy            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Async SQL Driver
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE: PostgreSQL                       │
│                   Hosted on Neon / Render                   │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Primary Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router) + React** | Server-Side Rendering (SSR) for static resource SEO, rapid client-side transitions for the check-in modal, optimal mobile bundle size. |
| **Styling** | **Tailwind CSS** | Rapid prototyping, precise utility-first color control for soothing wellness palette, zero runtime CSS overhead. |
| **Animation** | **Framer Motion** | Physics-based spring animations for breath circle and seamless step transitions without layout shifts. |
| **Icons** | **Lucide React** | Lightweight, clean, modern stroke icons matching modern SaaS standards. |
| **Backend Framework**| **FastAPI (Python 3.11+)** | High-performance asynchronous endpoint processing, automatic OpenAPI/Swagger documentation, strict type validation with Pydantic. |
| **Database** | **PostgreSQL** | Rock-solid relational integrity, native JSON support, ACID compliance, instantaneous serverless hosting on Neon. |
| **Hosting & Deploy** | **Vercel (FE) + Render (BE)** | Industry-standard deployment workflows with automated GitHub PR preview environments and zero DevOps maintenance. |

---

## 13. System Architecture & Responsibilities

1. **Presentation Layer (Next.js):**
   * Manages client-side routing, responsive layout, local state (timer intervals, current step), and guest `localStorage`.
   * Handles optimistic UI updates during timer completion.
2. **API Communication Layer (Axios / Fetch Client):**
   * Encapsulates REST calls, JWT attachment via interceptors, and gracefully handles network offline state.
3. **Application & Business Logic Layer (FastAPI):**
   * Validates payloads via Pydantic models.
   * Evaluates the recommendation decision matrix deterministically.
   * Enforces rate limiting and password hashing via Argon2/Bcrypt.
4. **Data Persistence Layer (PostgreSQL & SQLAlchemy ORM):**
   * Maintains persistent user accounts, logged check-ins, and study analytics.

---

## 14. UI/UX Design System Guidelines

### 14.1 Visual Direction
**"Soft Modern Wellness × Modern SaaS × Student-Friendly"**
* **The Atmosphere:** A digital sanctuary. Think of a quiet, sunlit library nook with plants, clean wooden desks, and warm coffee.
* **Avoid:**
  * Cold, sterile hospital blues or clinical whites.
  * Hyper-corporate enterprise tables or dark, aggressive crypto aesthetics.
  * Overstimulating neon notifications or childish cartoon overkill.

### 14.2 Color Palette Tokens
* **Primary Background:** `#FAFAF8` (Warm Alabaster / Soft Oatmeal — reduces retinal fatigue).
* **Card Surface:** `#FFFFFF` with subtle border `#E8E6E1` and 4px soft blur shadow.
* **Text Primary:** `#1C1E1B` (Deep Forest Charcoal — high contrast, never pure #000).
* **Text Secondary:** `#5C615A` (Muted Sage Grey).
* **Brand Accents:**
  * *Mellow Sage (Calm):* `#5B8266` (Primary action buttons, breathing state).
  * *Warm Terracotta (Alert/Stress):* `#D97757` (Gentle highlight, never harsh pure red).
  * *Golden Amber (Focus):* `#E5A93B` (Timer ring, focus accents).

### 14.3 Typography & Sizing
* **Display Font:** Clean modern sans-serif (`Inter`, `Plus Jakarta Sans`, or `Geist`).
* **Scale:** Generous line-height ($1.5 - 1.65\times$), minimum body text `16px` on mobile to prevent iOS form auto-zoom.

---

## 15. Accessibility (a11y) Requirements

* **Contrast Ratios:** All text-to-background combinations meet **WCAG 2.1 AA** ($\ge 4.5:1$ for regular text, $\ge 3.0:1$ for large headings).
* **Non-Color Reliance:** State changes (selected mood, timer running) include text badges and icon changes in addition to color shifts.
* **Keyboard Navigability:** Full tab traversal with distinct, high-visibility focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-600`).
* **Screen Reader Support:** Accessible ARIA attributes (`aria-live="polite"` for timers, `role="progressbar"`, explicit `aria-label` on emoji buttons).
* **Reduced Motion:** Respects `prefers-reduced-motion` media queries; animated breathing circle transitions to a gentle numerical countdown when active.
* **Touch Targets:** Minimum touch target size of **$48 \times 48\text{ px}$** for all interactive buttons and chips on mobile screens.

---

## 16. Privacy & Data Ethics

* **Zero Health Surveillance:** EXMELLO explicitly refuses to store diagnostic psychiatric labels, campus student IDs, or university grades.
* **Data Minimization Principle:** Collect only the exact parameters required to serve the recommendation.
* **Local-First Capabilities:** Guests can utilize the product perpetually without submitting personal identification.
* **Right to Erasure:** A simple `"Delete My Account & Data"` button in the user profile immediately triggers a cascading delete of all user rows.

---

## 17. Security & Resilience Requirements

* **Authentication Security:** Passwords hashed with `bcrypt` (work factor 12). Tokens signed with secure secrets stored exclusively in environment variables.
* **Input Validation:** Strict Pydantic and TypeScript validation; string length limits to prevent payload bloat.
* **SQL Injection & XSS Prevention:** SQLAlchemy parameter binding used universally; React automatic output escaping prevents raw HTML injection.
* **CORS Policy:** Strict origin whitelisting allowing only the production frontend Vercel domain and local dev servers.
* **Environment Integrity:** Zero hardcoded credentials; `.env.example` templates committed without secrets.

---

## 18. Responsive Breakpoint Matrix

| Viewport | Device Class | Layout Adaptations |
| :--- | :--- | :--- |
| **375px** | Small Mobile (iPhone SE) | Single column, full-width tap chips, sticky bottom CTA, condensed hero typography. |
| **390px – 430px** | Standard Mobile (iPhone 14/15/Pro Max) | Single column with comfortable 16px edge padding, optimized $48\text{px}$ touch targets. |
| **768px** | Tablet (iPad portrait) | 2-column resource grid, centered 540px modal container for check-in flow. |
| **1440px** | Desktop / Laptop | Centered max-width application wrapper (`max-w-5xl`), subtle background ambient gradients. |

---

## 19. Complete Sitemap & Route Map

```
/ (Home - Hero, Value Prop, How It Works, Resource Teasers)
│
├── /checkin (Quick Check-in Wizard - 3 steps)
├── /recommendation (Dynamic Prescribed Micro-Action Card)
│
├── /focus (Distraction-Free Focus Timer: 15m / 25m / 50m)
├── /breathing (Guided Breathing Circle: Box & Physiological Sigh)
├── /reset (Micro-Reset Hub: 60s Eyes, Water, 2m Stretch, Brain Dump)
│
├── /resources (Student Guides Library - Category Filtered)
│   └── /resources/[id] (Full Guide Reading View)
│
├── /dashboard (Lightweight Activity History & Mindful Minutes)
├── /profile (Account settings, Email, Data Purge)
├── /login (User Sign In)
├── /register (User Sign Up)
└── /help (Urgent Student Crisis Helplines & University Resources)
```

---

## 20. Scope Definition (MVP vs Future)

### 20.1 Must Have (V1 MVP)
* Full landing page with instant value proposition and clear CTA.
* 3-step Quick Check-in flow executable in under 20 seconds.
* Deterministic Recommendation Engine with empathetic copy.
* 25-minute Pomodoro Focus Timer with start/pause/reset.
* Visual guided Breathing Circle (Box Breathing 4-4-4-4).
* Quick Reset screen with hydration, eye rest, and desk stretch prompts.
* Resource directory with at least 5 markdown student wellness guides.
* Dedicated `/help` page with international student crisis hotline information.
* Guest-friendly local state persistence.
* Mobile-responsive design down to 375px.

### 20.2 Should Have (V1.1 Post-Launch)
* Optional user registration and JWT authentication.
* Cloud sync for check-in history and completed focus minutes.
* Audio chimes for timer completion.
* Dark / Light mode toggle.

### 20.3 Nice to Have (V2 Future)
* Spotify/ambient audio player integration (white noise, rain, lofi).
* Calendar export for scheduled exam study blocks.
* University campus counseling directory integration.

### 20.4 Explicitly Excluded (Not in V1)
* **AI Chatbot:** Introduces hallucination risk, safety liability for distressed students, and unpredictable latency.
* **Social Feed / Leaderboards:** Fosters competitive comparison and academic guilt.
* **Complex Data Analytics:** Generates anxiety rather than relief.
* **Push Notifications:** Interruptive notifications distract studying students.

---

## 21. Phased Development Roadmap

```
Phase 1 (Requirements) ──► Phase 2 (UI/UX Design) ──► Phase 3 (Frontend MVP)
                                                               │
Phase 6 (Integration)  ◄── Phase 5 (Engine)       ◄── Phase 4 (Backend/DB)
        │
        ▼
Phase 7 (Testing & a11y) ──► Phase 8 (Deployment) ──► Phase 9 (Portfolio Docs)
```

### Phase 1: Requirements & UX Specifications
* **Goal:** Finalize SSOT document and UX contracts.
* **Deliverable:** Approved `requirements.md`.

### Phase 2: UI/UX Design System (Google Stitch)
* **Goal:** Establish visual design tokens, component kit, and high-fidelity screens.
* **Deliverable:** Stitch screen specs, color palettes, spacing tokens, and component mockups.

### Phase 3: Frontend Prototype (Next.js + Tailwind)
* **Goal:** Implement responsive UI, local state check-in wizard, focus timer, and breathing circle.
* **Deliverable:** Navigable frontend prototype running locally with mock data.

### Phase 4: Backend & Database (FastAPI + PostgreSQL)
* **Goal:** Spin up REST API, SQLAlchemy models, migration scripts, and auth endpoints.
* **Deliverable:** Working FastAPI server with OpenAPI documentation at `/docs`.

### Phase 5: Recommendation Engine Implementation
* **Goal:** Code the deterministic rule-matrix evaluator in FastAPI with unit test coverage.
* **Deliverable:** Rule evaluation service returning accurate recommendations under 10ms.

### Phase 6: Full Integration
* **Goal:** Connect Next.js frontend to FastAPI backend; wire up guest and authenticated modes.
* **Deliverable:** End-to-end operational web app.

### Phase 7: Quality Assurance, Accessibility & Testing
* **Goal:** Run WCAG 2.1 AA audits, mobile viewport testing, and cross-browser checks.
* **Deliverable:** 0 high-severity accessibility defects, 100% core flow pass rate.

### Phase 8: Cloud Deployment
* **Goal:** Deploy Next.js to Vercel and FastAPI/PostgreSQL to Render and Neon.
* **Deliverable:** Live, public production URL with automated CI/CD.

### Phase 9: Portfolio Case Study & README Documentation
* **Goal:** Package the project for presentation to engineering hiring managers.
* **Deliverable:** Comprehensive `README.md`, architectural diagrams, and video walkthrough.

---

## 22. AI Development Workflow & Tool Responsibilities

To guarantee coherent code quality and prevent merge conflicts, each AI tool is assigned an exclusive domain. **GitHub is the sole Single Source of Truth.**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE (Product & UX)                    │
│     Maintains requirements.md & architectural constraints   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Specifies requirements
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 GOOGLE STITCH (UI/UX Design)                │
│             Generates component specs & layouts             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Design specs
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             ANTIGRAVITY GEMINI (FE Prototyping)             │
│        Builds Next.js UI scaffolding & client logic         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Codebase PR
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             CODEX ASTRA (Lead BE & Database Eng)            │
│         Builds FastAPI, PostgreSQL models, and APIs         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Backend PR
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              CURSOR + GROK (Review & Integration)           │
│        Conducts full integration, debugging & code review   │
└─────────────────────────────────────────────────────────────┘
```

### Critical AI Collaboration Rule:
> **NO CONCURRENT FILE EDITS:** Multiple AI agents must never write to the same files or branches concurrently. All changes must pass through feature branches and pull requests verified against this `requirements.md`.

---

## 23. Git Branching & Merge Strategy

```
main (Production-ready, protected)
 ▲
 │ Pull Request (Passing CI, full QA review)
develop (Staging & integration)
 ▲
 │ Feature Branches
 ├── feature/frontend-scaffold
 ├── feature/checkin-wizard
 ├── feature/focus-timer
 ├── feature/breathing-circle
 ├── feature/backend-api
 └── feature/recommendation-engine
```

### Branch Rules:
1. **`main`:** Contains strictly deployable production code. Direct commits are forbidden.
2. **`develop`:** Active integration branch.
3. **`feature/*`:** Created off `develop` for a single isolated task. Merged back via Pull Request after linting and testing.

---

## 24. Project-Level Definition of Done (DoD)

A release is marked complete **only** when all of the following criteria are satisfied:
- [ ] User can understand EXMELLO's purpose within 5 seconds of viewing `/`.
- [ ] Quick Check-in flow can be completed in $\le 20$ seconds without errors.
- [ ] Recommendation Engine produces accurate, empathetic actions for all mood/concern pairs.
- [ ] Focus Timer accurately tracks time with reliable start, pause, resume, and reset states.
- [ ] Breathing exercise animates smoothly at 60fps and respects reduced motion settings.
- [ ] All pages render seamlessly across 375px, 390px, 768px, and 1440px viewports.
- [ ] Contrast ratios strictly meet WCAG 2.1 AA standards.
- [ ] Zero clinical or medical claims exist in copy; Crisis Helpline is accessible in 1 tap.
- [ ] REST API tests achieve 100% pass rate on core recommendation routes.
- [ ] Application is successfully deployed to public production URLs (Vercel + Render).
- [ ] Comprehensive `README.md` is published with architecture diagram and setup instructions.

---

## 25. Detailed Feature Acceptance Criteria (Gherkin Format)

### 25.1 Feature: Quick Check-in
```gherkin
Feature: Quick Check-in Flow
  As a stressed university student
  I want to register my current mental state in seconds
  So that I can get immediate relief without filling out tedious forms

  Scenario: Successful quick check-in with required fields
    Given the user navigates to "/checkin"
    When the user selects mood "Stressed"
    And the user selects concern "Running out of time"
    And the user skips the optional need
    And clicks "Get Recommendation"
    Then the system records the response within 200ms
    And navigates the user to "/recommendation"
    And the recommendation displays "15-Minute Focus Sprint" as the primary action

  Scenario: Attempting to submit without selecting required fields
    Given the user is on Step 1 of "/checkin"
    When the user does not select a mood
    Then the "Next" button remains disabled
    And the user cannot advance to Step 2
```

### 25.2 Feature: Recommendation Generation
```gherkin
Feature: Recommendation Generation
  As an overwhelmed student
  I want a gentle, non-judgmental suggestion
  So that I know the immediate next micro-step to take

  Scenario: User reports severe overwhelm
    Given the user completes a check-in with mood "Overwhelmed" and concern "Can't stop thinking"
    When the recommendation is rendered
    Then the headline states "Let's pause the world for three minutes"
    And the primary action button is "Start 3-Minute Breathing"
    And the secondary action button is "1-Minute Water Reset"
    And no medical diagnosis or psychological scoring is shown
```

### 25.3 Feature: Focus Timer
```gherkin
Feature: Focus Timer Operation
  As a student ready to work
  I want an uncluttered 25-minute countdown
  So that I can study without visual distractions

  Scenario: Starting and completing a focus session
    Given the user is on the "/focus" page
    When the user taps "Start"
    Then the timer counts down second-by-second from 25:00
    And distracting navigation elements are subdued
    When the timer reaches 00:00
    Then a gentle completion sound plays
    And a celebratory card offers a 5-minute break option
```

### 25.4 Feature: Breathing Exercise
```gherkin
Feature: Guided Breathing Circle
  As a student experiencing acute physical anxiety
  I want a visual breathing guide
  So that I can slow my respiratory rate and lower my heart rate

  Scenario: Running box breathing
    Given the user selects the "Box Breathing" mode on "/breathing"
    When the user taps "Begin"
    Then the circle expands smoothly over 4.0 seconds with label "Inhale"
    And the circle remains static for 4.0 seconds with label "Hold"
    And the circle contracts smoothly over 4.0 seconds with label "Exhale"
    And the circle remains static for 4.0 seconds with label "Hold"
    And the cycle count increments by 1
```

### 25.5 Feature: Frictionless Guest Accessibility
```gherkin
Feature: Guest Mode Support
  As a first-time visitor with an impending exam
  I want to use the app immediately without registering
  So that I do not waste study time creating an account

  Scenario: Unauthenticated core access
    Given an unauthenticated visitor opens EXMELLO
    When they complete a check-in and launch a focus timer
    Then no login wall or mandatory modal blocks their progress
    And their current session is preserved locally in localStorage
```

---

## 26. Future README.md Specification

The root repository `README.md` must be constructed according to the following mandatory structure:
1. **Hero Header:** Project name, badge array (Build status, Next.js, FastAPI, License, WCAG AA compliance), live URL link.
2. **The Problem:** 2-paragraph summary of student exam paralysis and cognitive overload.
3. **The Solution (EXMELLO):** Highlighting the 15-second check-in to micro-action pipeline.
4. **Key Features:** Bulleted breakdown with embedded UI GIFs/screenshots (Landing, Check-in, Timer, Breathing).
5. **Tech Stack & Architecture:** Diagram outlining Next.js $\rightarrow$ FastAPI $\rightarrow$ PostgreSQL.
6. **Local Development Setup:**
   * Prerequisites (Node.js 18+, Python 3.11+, PostgreSQL).
   * Frontend installation commands (`npm install && npm run dev`).
   * Backend installation commands (`poetry install` or `pip install -r requirements.txt && uvicorn main:app --reload`).
7. **Environment Variables Reference:** Table of `.env` keys for both client and server.
8. **API Documentation:** Reference to `/docs` (Swagger UI).
9. **Accessibility & Ethical Design Commitments:** Summary of WCAG compliance and non-clinical data policies.
10. **License & Academic Portfolio Attribution:** MIT License + University attribution.

---

## 27. Next Step for Development Team

> **HANDOFF INSTRUCTION:**  
> This `requirements.md` file serves as the approved **Single Source of Truth (SSOT)** for EXMELLO.  
> 
> The next AI tool / designer (**Google Stitch**) should directly ingest this document to produce the UI/UX Design System, component specifications, typography scales, and high-fidelity screen mockups. No requirements, moods, rules, or schemas should be altered during design without updating this document first.
