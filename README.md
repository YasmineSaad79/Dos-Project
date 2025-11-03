# 📚 Distributed Operating System Course Project  
## 🧩 Microservices Architecture

This project demonstrates a simple microservices-based bookstore system using **Node.js**, **Express**, **SQLite**, and **Docker**.  
It’s designed for educational purposes under the **Distributed Operating Systems** course.

<p align="center">
  <img src="./images/Microservices-architecture-diagram.png" alt="Architecture" width="600"/>
</p>


---

### 🗂️ Services Overview

| Service         | Port  | Description                                                   |
|-----------------|-------|---------------------------------------------------------------|
| Catalog Service | 5001  | Manages books catalog (search, info, reserve, update)         |
| Order Service   | 5002  | Handles book purchases and order storage                     |
| Client Service  | 5000  | Receives user requests and routes them to the backend services|

Each service is isolated and communicates via REST APIs.

---

### 🏗️ Project Structure

```
/Dos-Project
│
├── src/
│   ├── catalog-service/
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── data/
│   │       └── catalog.db
│   │
│   ├── order-service/
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── data/
│   │       └── orders.db
│   │
│   ├── client-service/
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── ... (client UI files or APIs)
│
├── images/
│   └── Microservices-architecture-diagram.png
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── bookstore_microservices_report.pdf
└── README.md
```

---

### ⚙️ Prerequisites

- ✅ Git & GitHub  
- ✅ Node.js & npm  
- ✅ SQLite3  
- ✅ Postman (for API testing)  
- ✅ Docker & Docker Compose  

---

### 🚀 How to Run Locally (without Docker)

1. **Clone the repository**
```bash
git clone https://github.com/YasmineSaad79/Dos-Project.git
cd Dos-Project
```

2. **Start services manually**

```bash
# Catalog Service
cd src/catalog-service
npm install
node index.js
# Runs on http://localhost:5001
```

```bash
# Order Service (in new terminal)
cd src/order-service
npm install
node index.js
# Runs on http://localhost:5002
```

```bash
# Client Service (in new terminal)
cd src/client-service
npm install
node index.js
# Runs on http://localhost:5000
```

---

### 🐳 How to Run with Docker Compose

> Ensure Docker and Docker Compose are installed on your machine.

1. **Clone and enter the project**
```bash
git clone https://github.com/YasmineSaad79/Dos-Project.git
cd Dos-Project
```

2. **Build and start all services**
```bash
docker-compose up --build
```

3. **Check running containers**
```bash
docker ps
```

Expected services:
- `dos-project_catalog-service_1`
- `dos-project_order-service_1`
- `dos-project_client-service_1`

4. **Stop all containers**
```bash
docker-compose down
```

---

### 📡 API Endpoints Summary

#### 🟦 Catalog Service — `http://localhost:5001`

| Method | Endpoint          | Description                            |
|--------|-------------------|----------------------------------------|
| GET    | `/search/:topic`  | Search books by topic                  |
| GET    | `/info/:id`       | Get book details                       |
| POST   | `/reserve/:id`    | Reserve a book                         |
| PUT    | `/update/:id`     | Update book price/quantity             |

#### 🟩 Order Service — `http://localhost:5002`

| Method | Endpoint          | Description                            |
|--------|-------------------|----------------------------------------|
| POST   | `/purchase/:id`   | Purchase and store order               |
| GET    | `/health`         | Health check                           |

#### 🟧 Client Service — `http://localhost:5000`

| Method | Endpoint          | Description                            |
|--------|-------------------|----------------------------------------|
| GET    | `/search/:topic`  | Client-side search                     |
| GET    | `/info/:id`       | View book details from UI              |
| GET    | `/purchase/:id`   | Trigger book purchase from client      |

---

### ✅ Expected Behavior

- Searching a topic lists all matching books.
- Viewing book info shows stock and price.
- Reserving or purchasing a book decreases available quantity.
- Order Service records all purchases into its own database.
- Console logs confirm all requests for debugging.

---

### 🗑️ Resetting Databases (Optional)

If needed, you can reinitialize the databases by deleting them manually:

```bash
rm src/catalog-service/data/catalog.db
rm src/order-service/data/orders.db
```

Then re-run the services to auto-generate new databases.

---

### 🧭 Notes

- Each service must be reading `PORT` from `process.env.PORT` or default fallback.
- Logs are printed to terminal for request tracing and debugging.

---

### 📋 Author

**Yasmine Saad, Afaf Nasr**  
Distributed Operating Systems – An-Najah National University  


