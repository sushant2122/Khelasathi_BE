# KhelaSathi - Futsal Booking Backend

**KhelaSathi** is a real-time futsal booking backend application with a **multitenancy architecture**. It allows **venue owners** to list their futsal courts, create booking slots, define closing days, and manage bookings, all under an **admin approval system**. Users can book available slots with **Khalti payment integration**, and a **credit point system** enhances user engagement. Real-time updates are handled using **Socket.IO**.

---

## 🔧 Features

- 🏟️ Multi-venue support with multitenancy structure.
- 📆 Real-time slot booking with socket implementation.
- 🧾 Court listing, slot creation, and closing day setup.
- ✅ Admin approval system for courts and slot visibility.
- 💳 Integrated with **Khalti** for secure payment.
- 🎯 Credit point system to reward users.
- 📦 RESTful API using Node.js + Express.
- 🗃️ PostgreSQL for robust relational data storage.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Socket.IO
- JWT (Authentication)
- Khalti API (Payment)
- dotenv
- CORS, Helmet, Bcrypt

---

## 🖥️ Local Setup Instructions

Follow these steps to get the backend running on your local machine:

---

### 1. 🐘 Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

- **Linux/macOS**:  
  ```bash
  sudo apt install postgresql postgresql-contrib
