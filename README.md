<div align="center">
  <br />
  <img src="https://img.icons8.com/nolan/128/cyber-security.png" alt="NeuroX Logo" width="128" />
  <h1><b>NeuroX: Secure AI Assessment Platform</b></h1>
  <h3><i>"Smart, Fair, and Secure Online Testing"</i></h3>

  <p align="center">
    <img src="https://img.shields.io/badge/Security-Enterprise--Grade-00FF41?style=for-the-badge&logo=shield&logoColor=black" alt="Security" />
    <img src="https://img.shields.io/badge/Architecture-Zero--Trust-00BFFF?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Architecture" />
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  </p>

  <p align="center">
    <b>Built for secure and cheat-proof hiring assessments</b>
  </p>

  ---
</div>

## 🛡️ What is NeuroX?

**NeuroX** is a secure platform for online tests and coding exams. We make sure that every test is fair by using AI to block cheating, track suspicious behavior, and verify the candidate's identity. 

We don't just lock the browser; we monitor *how* a person takes the test—tracking things like their typing speed, if they copy-paste, and what device they are using.

---

## 🔐 How We Stop Cheating

NeuroX uses multiple layers of security to keep exams safe:

### 1. Identity & Login Security
- **Smart Freeze (Lockout):** If someone enters the wrong password 5 times, their account is locked for 15 minutes to stop hackers from guessing passwords.
- **Device Tracking:** We record details about the computer used to log in (like screen size, timezone, and processing power). This helps us know if someone gave their account to another person.
- **Login History:** We keep a log of where and when every user logs in.

### 2. Behavioral Tracking (How they type and act)
Our AI watches *how* the user interacts with the exam to make sure a real human is taking it:
- **Typing Speed:** We track how fast they type to see if a bot is injecting answers.
- **Habits:** We count how many times they hit backspace or change their answers. Natural human behavior looks different than someone perfectly typing an answer they got from ChatGPT.

### 3. Active Threat Blocking
During the exam, the system watches for direct rule-breaking:
- **No Copy & Paste:** We catch and flag anytime a user hits `Ctrl+C` or `Ctrl+V`.
- **Keyboard Shortcuts Blocked:** We stop users from using shortcuts to open new tools or save the page (`Ctrl+S`, `Alt+Tab`).
- **Tab Switching Alerts:** If the user switches to Google or another tab, we log it immediately.
- **Speed Check:** If someone gets a perfect score in just 2 minutes on a 30-minute test, our system automatically flags it as unnatural.

---

## 📊 Who Can Do What? (Dashboards & Roles)

NeuroX has three main roles, each with their own dashboard and permissions:

### 1. The Admin (Security Command Center)
Admins have full visibility into the security of the platform. Inside the Admin Dashboard, they can see:
* **The Forensic Log:** A live feed of every test taken and every rule broken.
* **Device Details:** Exactly what kind of computer and browser someone used to log in.
* **Violation Breakdown:** If an exam was flagged, the Admin can see *exactly* why (e.g., "Candidate switched tabs 4 times" or "Candidate pressed Ctrl+V").
* **Behavioral Biometrics:** A summary of how the person typed, including their average delay between keystrokes and how many times they used the backspace key.
* **Login History:** A record of the last 3 IP addresses used by any account.

### 2. The Recruiter / HR 
Recruiters focus on finding the right talent without worrying about the technical security. They can:
* **Create Job Roles:** Type in a job description and let the AI automatically generate a customized test.
* **View Candidates:** See a list of everyone who applied and passed the test.
* **View Scores & Integrity:** See a candidate's final score alongside their "Health Index"—a percentage score showing how trustworthy their test session was.

### 3. The Candidate (The Test Taker)
Candidates get a clean, distraction-free environment to take their test. To ensure fairness, the system strictly enforces the following rules:
* **Cannot Copy Paste:** The system entirely blocks the ability to paste code from ChatGPT or external sites.
* **Cannot Leave the Screen:** Switching tabs or minimizing the browser instantly flags a "Focus Loss" violation.
* **Cannot Use Shortcuts:** System shortcuts like `Ctrl+S`, `Ctrl+P`, saving, or printing the exam questions are blocked.
* **Must Type Naturally:** The system records their typing cadence to ensure they are manually writing the code, rather than injecting it with a script.
* **Auto-Termination:** If a candidate repeatedly breaks the rules (e.g., trying to paste code multiple times), the exam automatically ends, submits what they have, and locks them out.

---

## 🛠️ How It's Built

| Part of the App | What it does | Technologies Used |
| :--- | :--- | :--- |
| **Frontend** | The user interface and tracking screens | React 18, Tailwind CSS, Vite |
| **Backend** | The brain, saving data and checking rules | Node.js, Express, Supabase (Database) |
| **Security AI** | The smart models checking for cheating | Python, Scikit-learn, Llama 3.3 |
| **Code Testing** | Running candidate code safely | Piston API Engine |

---

## ⚙️ How to Run the App

You can run the entire NeuroX platform locally on your computer with one simple command.

### 1. Download the Code
```bash
git clone https://github.com/prathamsandesara/NeuroX.git
cd NeuroX
```

### 2. Start the Servers
Run our startup script. This will automatically start the React website, the Node database connection, and the Python AI checking models all at once.
```bash
./run_all.sh
```

**Where to view it:**
- Application: `http://localhost:5173`
- Backend API: `http://localhost:4000`

---

<div align="center">
  <p><b>NeuroX</b>: Fair, Secure, and Smart Assessments.</p>
  <p>© 2026. Built for Integrity.</p>
</div>
