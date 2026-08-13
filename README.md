# Facial Recognition Attendance System

A web-based **Facial Recognition Attendance Management System** built with **React.js** and **Django REST Framework**. The system automates employee attendance by identifying employees through facial recognition and automatically recording their check-in and check-out time.

## 📌 Project Overview

The Facial Recognition Attendance System is designed to reduce manual attendance entry and provide an efficient way to manage employee attendance.

Instead of manually entering an Employee ID, an employee simply opens the attendance page, stands in front of the camera, and taps **Scan Face**. If the captured face matches a registered employee, the system automatically identifies the employee and records attendance.

The system also provides an admin interface for employee management, attendance monitoring, filtering, searching, pagination, and Excel report generation.

---

## ✨ Key Features

### 🔐 Authentication

* Secure login system
* Protected application routes
* Authentication-based access to the dashboard

### 👨‍💼 Employee Management

* Add new employees
* Store employee information
* Upload employee photographs
* Store facial recognition data
* View employee details
* Edit employee information
* Activate/Deactivate employees
* Search employees
* Paginated employee list

### 🤖 Facial Recognition Attendance

* Camera-based face scanning
* Automatic employee identification
* No manual Employee ID entry required
* Face matching with registered employee data
* Automatic attendance recording

### 🕐 Attendance Management

* Automatic check-in
* Automatic check-out
* Prevents duplicate attendance completion
* Today's attendance view
* Attendance history
* Employee-wise attendance
* Department-wise attendance

### 🔎 Attendance Filters

Attendance records can be filtered by:

* Date
* Department
* Employee
* Employee ID
* Employee name
* Search keywords

### 📄 Pagination

* Server-side attendance pagination
* Next/Previous navigation
* Total attendance record count
* Reduces unnecessary data loading

### 📊 Excel Reports

* Daily attendance Excel report
* Monthly attendance Excel report
* Employee-specific monthly report
* Automatic Excel file generation using OpenPyXL

---

# 🤖 How Facial Recognition Works

The attendance workflow is:

```text
Employee opens Attendance Page
            ↓
        Camera Opens
            ↓
      Employee scans face
            ↓
     Face is detected
            ↓
   Face is compared with
   registered face data
            ↓
       Face matched?
        ↙          ↘
      YES           NO
       ↓             ↓
Employee identified  Reject scan
       ↓
Employee ID sent to
Django backend
       ↓
Attendance logic
       ↓
Check-in / Check-out
```

The employee only needs to stand in front of the camera and scan their face.

---

# 🧠 OpenCV

**OpenCV (Open Source Computer Vision Library)** is used as part of the computer vision workflow.

It is responsible for processing camera/image input and assisting with face detection and recognition-related operations.

The general workflow is:

```text
Camera Input
     ↓
OpenCV / Face Processing
     ↓
Face Detection
     ↓
Face Recognition / Matching
     ↓
Employee Identification
     ↓
Attendance API
```

The registered employee's face information is associated with the employee record so that the system can identify the employee during attendance scanning.

---

# 🕐 Attendance Logic

The backend controls the attendance logic.

## First Scan — Check In

If the employee has no attendance record for the current date:

```text
First Scan
    ↓
No attendance record found
    ↓
Create attendance record
    ↓
Save check_in
```

The current time is stored as the employee's `check_in`.

---

## Second Scan — Check Out

If today's attendance exists but `check_out` is empty:

```text
Second Scan
    ↓
Attendance exists
    ↓
check_out is empty
    ↓
Save current time as check_out
```

---

## Third Scan — Already Completed

If both `check_in` and `check_out` already exist:

```text
Third Scan
    ↓
check_in exists
check_out exists
    ↓
Attendance already completed
```

The system does not create another attendance record.

### Why is this logic in Django?

Attendance is an important business rule, so it is handled by the backend instead of depending only on frontend validation.

This prevents users from manipulating frontend logic to create incorrect attendance records.

---

# 🏗️ System Architecture

```text
                    FRONTEND
                  React.js + Vite
                        │
                        │ Axios / REST API
                        ↓
                    BACKEND
              Django REST Framework
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Models         Views       Serializers
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                    Database
                        │
                        ↓
              Attendance / Employees
```

For facial recognition:

```text
Camera
  ↓
Face Recognition Module
  ↓
Employee Identification
  ↓
Django Attendance API
  ↓
Database
```

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React

## Backend

* Python
* Django
* Django REST Framework
* Django Filter
* OpenPyXL

## Computer Vision

* OpenCV
* Face recognition processing

## Database

* SQLite / relational database supported through Django ORM

## Development Tools

* VS Code
* Git
* GitHub
* npm
* Python Virtual Environment

---

# 📁 Project Structure

A simplified project structure:

```text
facial-recognition-attendance/
│
├── backend/
│   ├── manage.py
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── employees/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── attendance/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── api/
│   │   ├── context/
│   │   └── routes/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🔄 React ↔ Django Communication

The frontend communicates with Django through REST APIs.

For example, fetching employees:

```javascript
const response = await api.get("employees/");
```

The request goes to Django:

```text
React
 ↓
Axios
 ↓
Django REST API
 ↓
View
 ↓
Serializer
 ↓
Model / Database
```

The backend returns JSON:

```text
Django
 ↓
JSON Response
 ↓
Axios
 ↓
React State
 ↓
UI
```

---

# 🧩 Django Architecture

The backend follows Django's Model-View-Serializer architecture.

## Model

Models define the database structure.

For example, the Employee model contains information such as:

```text
employee_id
name
department
designation
photo
face_encoding
is_active
created_at
updated_at
```

The Attendance model stores attendance-related information such as:

```text
employee
date
check_in
check_out
```

---

## View

Views contain the application's backend logic.

Examples include:

```text
AttendanceListCreateAPIView
AttendanceRetrieveUpdateDestroyAPIView
TodayAttendanceAPIView
RecordAttendanceAPIView
DailyAttendanceReportAPIView
MonthlyAttendanceReportAPIView
```

---

## Serializer

Serializers convert Django/Python objects into JSON so that React can consume the data.

They also validate incoming API data before saving it to the database.

---

# 🔎 Attendance Filtering

The backend uses Django REST Framework filtering and searching.

Supported filters include:

```text
Date
Employee ID
Department
```

Search fields include:

```text
Employee ID
Employee Name
Department
Designation
```

Example request:

```text
GET /api/attendance/?employee__department=IT
```

The backend processes the filter and returns only matching attendance records.

---

# 📄 Pagination

Attendance data is paginated using Django REST Framework.

A typical response contains:

```json
{
  "count": 50,
  "next": "...",
  "previous": null,
  "results": []
}
```

React uses:

```text
count
next
previous
results
```

to display attendance records and control the Previous/Next buttons.

Server-side pagination prevents the frontend from loading a large number of attendance records at once.

---

# 📊 Excel Report Generation

Excel reports are generated dynamically using **OpenPyXL**.

## Daily Report

The daily report contains:

```text
Date
Employee ID
Employee Name
Department
Designation
Check In
Check Out
Status
```

Example:

```text
attendance_2026-08-10.xlsx
```

## Monthly Report

Monthly reports can be generated for:

* All employees
* A specific employee

Example:

```text
attendance_2026-08.xlsx
attendance_2026-08_EMP001.xlsx
```

The Excel file is generated on the server and returned as a downloadable HTTP response.

---

# 🔐 Security and Validation

Important business validations are handled on the backend.

For attendance recording:

* Employee ID must exist
* Employee must be active
* Duplicate completed attendance is prevented
* Attendance date is determined by the server
* Check-in/check-out timestamps are generated by the backend

This prevents the frontend from being the only source of truth.

---

# ⚡ API Examples

### Authentication

```text
POST /api/auth/login/
```

### Employees

```text
GET    /api/employees/
POST   /api/employees/
GET    /api/employees/{id}/
PATCH  /api/employees/{id}/
PATCH  /api/employees/{id}/toggle-status/
```

### Attendance

```text
GET  /api/attendance/
POST /api/attendance/
GET  /api/attendance/today/
POST /api/attendance/record/
```

### Reports

```text
GET /api/attendance/reports/daily/
GET /api/attendance/reports/monthly/
```

---

# 🚀 Installation and Setup

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd facial-recognition-attendance
```

---

## 2. Backend Setup

Go to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django server:

```bash
python manage.py runserver
```

Backend will run on:

```text
http://127.0.0.1:8000/
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on the Vite development URL shown in the terminal.

---

# 🔄 Complete Attendance Workflow

```text
Admin Login
     ↓
Dashboard
     ↓
Employee Management
     ↓
Register Employee
     ↓
Employee Photo / Face Data
     ↓
Employee Uses Attendance Page
     ↓
Scan Face
     ↓
Face Recognition
     ↓
Employee Identified
     ↓
Django Attendance API
     ↓
First Scan?
   ↙       ↘
 YES       NO
  ↓         ↓
Check In   Check Existing Record
             ↓
       Check Out Empty?
          ↙       ↘
        YES        NO
         ↓          ↓
     Check Out   Already Completed
         ↓
       Database
         ↓
Attendance History
         ↓
Filter / Search / Pagination
         ↓
Daily / Monthly Excel Report
```

---

# 📈 Current Project Status

## Phase 1 — Completed

* Authentication
* Employee Management
* Facial Recognition
* Automatic Check-in
* Automatic Check-out
* Attendance Management
* Attendance Filtering
* Attendance Searching
* Pagination
* Daily Attendance
* Monthly Attendance
* Excel Export
* Employee Activation/Deactivation
* REST API integration
* React + Django integration

---

# 🔮 Future Scope

The project can be extended with several features.

### ⚙️ Settings Page

A dedicated settings section can be added for:

* Attendance configuration
* Face recognition settings
* Working hours
* Late arrival rules
* Early departure rules
* Organization information
* System preferences

### 👥 Multiple Admin / Sub-Admin Roles

Role-based access control can be introduced:

```text
Super Admin
    ↓
Full Access

Sub Admin
    ↓
Limited Access
```

For example, a Sub Admin could:

* View attendance
* View employees
* Generate reports

but would not be allowed to:

* Delete employees
* Edit critical employee information
* Change system settings
* Manage other administrators

### 📊 Advanced Dashboard

Add:

* Today's present employees
* Absent employees
* Late employees
* Total employees
* Attendance percentage
* Department-wise attendance charts
* Monthly attendance graphs

### 🔔 Notifications

Add notifications for:

* Late check-in
* Missing check-out
* Absent employees
* Attendance anomalies

### 📱 Mobile Optimization

Improve the system for mobile/tablet usage, especially for office attendance devices.

### ☁️ Deployment

The application can be deployed to a cloud server with:

```text
Frontend
   ↓
Cloud Hosting / CDN

Backend
   ↓
Cloud Server

Database
   ↓
Production Database
```

Production deployment can include:

* HTTPS
* Production database
* Environment variables
* Domain name
* Backend hosting
* Frontend hosting
* CORS configuration
* Static/media file storage

### 🗄️ Production Database

For production environments, the database can be moved from SQLite to a production-ready relational database such as PostgreSQL or MySQL depending on deployment requirements.

### 📝 Audit Logs

Track important admin actions such as:

* Employee created
* Employee updated
* Employee activated/deactivated
* Attendance modified
* Report generated

### 🤖 Advanced Face Recognition

Future improvements can include:

* Better recognition accuracy
* Multiple-face detection
* Anti-spoofing / liveness detection
* Improved lighting handling
* Recognition confidence thresholds
* Better camera/device management

---

# 🎯 Learning Outcomes

This project helped implement and understand:

* React.js
* React Hooks
* React Router
* Axios
* REST APIs
* Django
* Django REST Framework
* Django Models
* Serializers
* API Views
* Django ORM
* Filtering
* Searching
* Pagination
* Authentication
* CRUD operations
* File uploads
* Facial recognition
* OpenCV
* Database management
* Excel automation
* Git and GitHub
* Full-stack application architecture

---

# 👨‍💻 Author

**Aarav Shukla**

B.Tech — Computer Science & Engineering

Full Stack Developer | React.js | Django | REST APIs

---

# 📄 License

This project is developed for educational, demonstration and portfolio purposes.
