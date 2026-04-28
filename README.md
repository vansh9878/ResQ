# 🚑 RESQ – AI Powered Emergency Response System

## 🌟 Overview

**RESQ** is an AI-powered emergency response platform designed to reduce response time during critical situations such as accidents, medical emergencies, and distress scenarios.

The system combines **AI assistance, smart routing algorithms, volunteer networks, and real-time simulation** to deliver both **instant guidance** and **rapid physical response**.

---

## 🚀 Key Features

### 🤖 AI Emergency Assistant

* Provides **instant, actionable steps** in emergency situations
* Built using **Google Gemini (via AI Studio)** + **Puter.js**
* Structured responses:

  * Short
  * No fluff
  * Maximum 5 steps

---

### 🚨 Crash Detection (Concept + Trigger System)

* Detects emergency via:

  * Manual SOS trigger
  * Text input
  * Image-based detection (AI)
* Automatically activates response pipeline

---

### 🗺️ Smart Routing (Swiggy/Zomato Inspired)

* Assigns nearest volunteer using:

  * Distance calculation
  * Availability filtering
  * Service area matching
* Optimized for **fastest response time**

---

### 👥 Role-Based System

#### 👤 User

* Reports emergencies
* Uses AI assistant
* Applies to become volunteer

#### 🚑 Volunteer (Responder)

* Registers with:

  * Personal info
  * Vehicle details
  * Service area
  * Documents
* Gets access after admin approval

#### 🛠️ Admin

* Reviews volunteer applications
* Accepts / Rejects requests
* Controls system flow

---

### 🔁 Volunteer Workflow

```plaintext
User applies → Pending → Admin approval → Approved → Dashboard access
```

* No bypass allowed
* Real-time status updates
* Profile auto-sync with submitted data

---

### 🧠 Unified Map System

* Used across:

  * User
  * Admin
  * Volunteer dashboards

Features:

* Route visualization
* Movement simulation
* Emergency tracking

---

### 📊 Data Handling (Prototype Simulation)

* Uses **localStorage** for:

  * User data
  * Volunteer data
  * Status tracking
* Enables full system simulation without backend

---

### 🔐 Smart Login Routing

* Dynamic routing based on input:

  * `admin` → Admin dashboard
  * `volunteer` → Responder dashboard
  * others → User interface

---

### 🎨 Modern UI/UX

* Clean landing page with SOS interaction
* Smooth animations
* Responsive design
* Role-based dashboards

---

## 🧠 Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### AI & Integration

* Google Gemini (via Google AI Studio)
* Puter.js (AI integration)
* Hugging Face (image detection - optional/concept)

### Tools & Platforms

* Antigravity (UI generation)
* Firebase (Auth / Hosting / Future backend)
* GitHub (Version control)

---

## ⚙️ How It Works

```plaintext
User triggers emergency →
AI gives instant guidance →
System identifies nearest volunteer →
Route is calculated →
Volunteer dispatched →
Help arrives
```

---

## 📦 Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/resq.git
```

2. Open the project folder

3. Run using Live Server or any local server

4. Make sure Puter.js / AI APIs are configured

---

## 🎥 Demo

* Demo Video: [Add Link]
* Live Prototype: [Add Link]

---

## 🚀 Future Scope

* Real-time GPS tracking
* Mobile app (Android/iOS)
* Government emergency integration
* AI-based severity detection
* Cloud backend (Firebase / Vertex AI)
* Multi-language support

---

## 🏁 Conclusion

RESQ transforms emergency response from:

❌ Slow, manual, uncoordinated
➡️
✅ Instant, intelligent, and connected

---

## 🤝 Contributors

* Aryan Giri
* Vansh Jain
* Khushi Ghia
* Aarya jagdale

---

## 💡 Inspiration

Inspired by real-world inefficiencies in emergency response systems and optimized using **delivery-based routing logic (like Swiggy/Zomato)** combined with **AI intelligence**.

---

## ⚡ Tagline

> "When seconds decide life, we respond instantly."
