# 🖨️ EzPrint — Smart Printing Management System

EzPrint is a modern **printing management system** designed to replace traditional solutions like PaperCut with a secure, scalable, and cost-efficient alternative.
It provides **secure print release, user management, and real-time monitoring** through a web-based interface.

---

## 📌 Project Overview

EzPrint is developed as a **student-led software engineering project** for the College of Computing & Mathematics (CCM).
The system focuses on improving printing workflows while ensuring **security, confidentiality, and cost control**.

### 🎯 Key Goals

* Reduce printing costs
* Ensure document confidentiality (secure release)
* Provide centralized management dashboard
* Support role-based access and quotas
* Enable scalable printer integration

---

## ✨ Features

* 🔐 **Secure Print Release** (PIN / authentication at printer)
* 👥 **User Management System** (Students, Faculty, Admins)
* 🏷️ **Role-Based Access Control (RBAC)**
* 📊 **Admin Dashboard** (usage stats, monitoring)
* 🖨️ **Printer Management**
* 📂 **Web Print Upload System**
* ⏳ **Auto File Deletion** (after print or 24 hours)
* 🔄 **Real-time Queue Management**
* ⚡ **Fast & Responsive UI**

---

## 🛠️ Tech Stack

### Frontend

* [Next.js](https://nextjs.org) (App Router)
* React
* Tailwind CSS
* Framer Motion (animations)
* GSAP (advanced animations)

### Libraries & Tools

* next-themes (dark/light mode)
* lucide-react (icons)
* react-icons
* @tabler/icons-react
* recharts (charts & analytics)
* clsx + tailwind-merge (clean styling)
* react-dropzone (file upload)
* @splinetool/react-spline (3D UI)

### Backend (Planned / Integrated)

* Node.js / Express (API layer)
* MongoDB (database)

---

### Install dependencies

```bash
npm install
npm install next-themes react-icons framer-motion @splinetool/react-spline lucide-react recharts clsx tailwind-merge @tabler/icons-react react-dropzone gsap @gsap/react
```

---

## 🚀 Getting Started

Run the development server:

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
/app
  /components
    /ui
    /shared
  /admin
  /user
/Data
  /Admin
/public
```

---

## 🔐 Core System Logic

* Only the **file uploader** can access the document before release
* Files are:

  * Deleted immediately after printing
  * Auto-deleted after 24 hours (if not printed)
* Secure release requires **authentication at printer**

---

## 🧠 System Roles

* **Admin**

  * Manage users, printers, and system settings
* **Sub-Admin**

  * Limited administrative control
* **User (Student/Faculty)**

  * Upload and release print jobs

---

## 🖨️ Printer Integration

EzPrint supports:

* Secure print queues
* Manual admin release (fallback)
* Multiple authentication methods:

  * PIN
  * Card
  * Login screen

---

## 📊 Dashboard Features

* Print usage analytics
* Real-time job monitoring
* System status overview
* Filters and search tools

---

## 🚧 Future Enhancements

* Full backend API integration
* AI-based print optimization
* Mobile app support
* Advanced reporting system
* Multi-campus deployment

---

## 🚀 Deployment

Deploy easily using:

* [Vercel](https://vercel.com/) (Frontend)
* AWS / VPS (Backend)

---

## 👨‍💻 Contributors

* EzPrint Development Team
* Software Engineering Students — KFUPM

---

## 📄 License

This project is developed for **educational and research purposes**.

---

## 📚 Learn More

* https://nextjs.org/docs
* https://nextjs.org/learn

---

## ⭐ Notes

* This project is intended as a **replacement for commercial printing systems**
* Built with scalability and real-world deployment in mind

---
