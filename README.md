# JustScan   
**Smart, AI Powered Entry Management Solution**

🔗 **Live Demo:** [https://hackathon-just-scan.vercel.app/](https://hackathon-just-scan.vercel.app/)

---

##  Project Overview

**JustScan** is a cutting edge web application designed to modernize and digitize entry/exit logging for universities, hostels, and organizations. We replace traditional manual ledgers and expensive hardware scanners with a **browser based, AI enhanced system** that turns any laptop or smartphone webcam into a sophisticated security gate.

JustScan solves the problem of efficient student tracking, ensuring security while maintaining speed and ease of use. It leverages **On-Device OCR** for instant scanning and **Google Gemini 2.5 Flash** for intelligent organization setup.

---

##  Key Features

### 1.  Intelligent Webcam Scanning (Client Side OCR)
JustScan eliminates the need for barcode scanners. It uses advanced computer vision directly in the browser:
- **Instant Recognition:** Uses **Tesseract.js** to perform Optical Character Recognition (OCR) on the video feed in real-time.
- **Smart Validation:** The system doesn't just read text; it validates it. It looks for **specific keywords** (unique to your organization) to ensure the card being shown is a valid ID card, not just a random piece of paper.
- **Image Pre-processing:** We implemented custom canvas image processing (grayscale conversion and high contrast binarization) to ensure high scan accuracy even in low light conditions.
- **Regex Pattern Matching:** Automatically detects and extracts Roll Numbers based on the organization's specific format.

### 2.  AI Powered Setup
Setting up a new organization is seamless with our Generative AI integration:
- **One-Click ID Analysis:** Admins can simply upload a photo of a sample ID card.
- **Gemini 2.5 Analysis:** The backend uses Google's Gemini 2.5 Flash model to analyze the ID card's layout, extract the institution's name, and identify **unique security keywords** to be used for validation.
- **Automated Configuration:** The AI automatically configures the scanning algorithm for that specific organization.

### 3.  Automated Entry/Exit Logging
- **Smart State Tracking:** The system automatically determines if a student is entering or entering based on their last status.
  - If a student is "In", scanning them marks them as "Out".
  - If a student is "Out", scanning them marks them as "In".


### 4. Dashboard & Analytics
- **Live Feed:** A real time table showing the latest entries and exits.
- **Search & Filter:** Instantly filter records by Name, Roll Number, or Hostel to find specific students.
- **Daily Stats:** View total active "Out" entries at a glance.

### 5. Attendance Reminders & Notifications
- **Automated Reminders:** Security admins can send email reminders to **all students who are currently 'Out'** with a single click.
- **Daily Reports:** Helps in ensuring all students have returned to the hostel/campus by the deadline.

### 6. Comprehensive Student Management
- **Bulk Import:** Supports uploading student data via **Excel/CSV** files for quick onboarding of thousands of students.
- **Duplicate Prevention:** Smart validation ensures no duplicate roll numbers are added.
- **Role Based Access:** 
  - **Owners:** Full control over organization settings and data.
  - **Staff:** Access to scanning and logging features only.

---

##  Tech Stack

JustScan is built on the **MERN Stack** with advanced AI integrations:

### Frontend
- **React.js (Vite):** Fast, modern UI framework.
- **Tailwind CSS:** For a responsive, glassmorphism-inspired "Cyberpunk/Modern" aesthetic.
- **Tesseract.js:** In-browser Optical Character Recognition (OCR).
- **React Webcam:** Handling media streams for scanning.
- **Context API:** For global state management (User, Toast, Modals).

### Backend
- **Node.js & Express:** Robust REST API.
- **MongoDB & Mongoose:** Scalable NoSQL database for storing organizations, users, and logs.
- **Google Gemini 2.5 Flash:** Generative AI for image analysis and ID verification.
- **Passport.js:** Secure Google OAuth authentication.
- **Multer:** Handling file uploads (ID cards, Excel sheets).
- **Nodemailer:** Sending email notifications.

---

## How It Works

1.  **Organization Setup:**
    - Admin logs in via Google.
    - Creates a new Organization (e.g., "IIT Roorkee").
    - **Step 1:** Uploads a sample ID card. **Gemini AI** scans it and extracts validation keywords.
    - **Step 2:** Uploads an Excel sheet of students.

2.  **The Scanning Process:**
    - The guard opens the **Scan Portal**.
    - A student shows their ID card to the webcam.
    - **Tesseract.js** reads the text ⮕ Checks for Keywords ⮕ Finds Roll No.
    - If valid, it sends the Roll No to the backend.

3.  **Entry Logging:**
    - Backend checks the student's current status.
    - Updates status (In ↔ Out) and logs the timestamp.
    - Frontend displays the student's details (Name, Photo, Room No).

4.  **End of Day:**
    - Admin clicks "Send Reminders".
    - System identifies all students with "Out" status and emails them to return.

---

##  Security & Performance
- **Token-Based Auth:** Secure JWT authentication for API access.
- **Access Codes:** Organizations are protected by unique access codes to prevent unauthorized joins.
- **Optimized OCR:** Image processing runs on a dedicated Web Worker to prevent UI freezing.

---

*Built with ❤️ for the Hack-The-Throne.*