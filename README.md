# 📚 Distributed Operating System Course Project  
## 🧩 Microservices Architecture

This project demonstrates a simple microservices-based bookstore system using **Node.js**, **Express**, **SQLite**, and **Docker**.  
It’s designed for educational purposes under the **Distributed Operating Systems** course.

![Architecture](./images/Microservices-architecture-diagram.png)
---



### 🗂️ Services Overview

| Service         | Port  | Description                                  |
|-----------------|-------|----------------------------------------------|
| Catalog Service | 5001  | Manages books catalog (search, info, reserve)|
| Order Service   | 5002  | Handles book purchases and order storage     |
| Front-end       | 5000  | Receives user requests (search/info/purchase) and routes them to backend |

Each service is isolated and communicates over REST APIs.


---
### 🏗️ Project Structure

### 🏗️ Project Structure

```
/Dos-Project
│
├── src/
│   ├── catalog-service/
│   │   ├── index.js
│   │   └── data/
│   │       └── catalog.db
│   │
│   ├── order-service/
│   │   ├── index.js
│   │   └── data/
│   │       └── orders.db
│   │
│   ├── client-service/
│   │   ├── index.js
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

- Git & GitHub  
- SQLite3 Database  
- Docker & Docker Compose  
- Nginx  
- Node.js & Express  
- Postman

---

### ⚙️ Prerequisites

- ✅ Git & GitHub  
- ✅ Node.js & npm  
- ✅ SQLite3  
- ✅ Postman (for testing endpoints)  
- ✅ Docker & Docker Compose  
- ✅ Nginx (optional for UI)

---

### 🚀 How to Run Locally (without Docker)

1. **Clone the repo:**
```bash
git clone https://github.com/YasmineSaad79/Dos-Project.git
cd Dos-Project
```

2. **Install dependencies for each service:**

```bash
cd src/catalog-service
npm install
node index.js
```

> 📘 The Catalog Service will start on **http://localhost:5001**

Open a **new terminal** and run:

```bash
cd ../order-service
npm install
node index.js
```

> 📗 The Order Service will start on **http://localhost:5002**

Then open another **new terminal** and run:

```bash
cd ../client-service
npm install
node index.js
```

> 📙 The Client Service will start on **http://localhost:5000**

---

### 🧪 Testing the System with Postman

You can test all endpoints using **Postman** (or curl).  
Below are the main endpoints to verify functionality:

#### 🟦 Catalog Service (Port 5001)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/search/:topic` | Search for books by topic (e.g. distributed, undergrad) |
| GET | `/info/:id` | Get book details (title, price, quantity) |
| POST | `/reserve/:id` | Reserve one copy of a book |
| PUT | `/update/:id` | Update book price or quantity |

#### 🟩 Order Service (Port 5002)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/purchase/:id` | Purchase a book (reserves and records order) |
| GET | `/health` | Check order service status |

#### 🟧 Client Service (Port 5000)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/search/:topic` | Search books via client interface |
| GET | `/info/:id` | View detailed info about a book |
| GET | `/purchase/:id` | Purchase a book via client interface |

---

### ✅ Expected Behavior

1. Searching a topic (e.g. `distributed`) lists matching books.  
2. Viewing book info (`/info/:id`) shows stock quantity and price.  
3. Purchasing a book (`/purchase/:id`) decreases stock in the catalog database.  
4. Each purchase creates a new record in the `orders.db` database.  
5. All services log activity in the console for debugging and verification.

---
### 🐳 How to Run with Docker Compose

> Make sure Docker and Docker Compose are installed on your machine.

---

#### 1. **Clone the repository:**
```bash
git clone https://github.com/YasmineSaad79/Dos-Project.git
cd Dos-Project
```

---

#### 2. **Build and start the containers:**
```bash
docker-compose up --build
```

This will:

- Start **Catalog Service** at `http://localhost:5001`
- Start **Order Service** at `http://localhost:5002`
- Start **Client Service** at `http://localhost:5000`

---

#### 3. **Check running containers:**
```bash
docker ps
```

You should see three running services:
- `dos-project_catalog-service_1`
- `dos-project_order-service_1`
- `dos-project_client-service_1`

---

#### 4. **Test the services:**

Use Postman or your browser:

| Service | Base URL | Example Endpoint |
|---------|----------|------------------|
| Catalog | `http://localhost:5001` | `/search/distributed` |
| Order   | `http://localhost:5002` | `/purchase/123` |
| Client  | `http://localhost:5000` | `/purchase/123` |

---

#### 5. **Stop and remove containers:**
```bash
docker-compose down
```

This command stops all services and removes the containers.

---

### 🗂️ Dockerfile Locations

Each service has its own Dockerfile located inside the `src/` folder:

```
src/
├── catalog-service/
│   └── Dockerfile
├── order-service/
│   └── Dockerfile
├── client-service/
│   └── Dockerfile
```

---

### 📝 docker-compose.yml Overview

The main `docker-compose.yml` file defines the three services, sets their ports, and builds each one from its respective subdirectory.

```yaml
services:
  catalog-service:
    build: ./src/catalog-service
    ports:
      - "5001:5001"

  order-service:
    build: ./src/order-service
    ports:
      - "5002:5002"

  client-service:
    build: ./src/client-service
    ports:
      - "5000:5000"
```


### 🧰 Stopping the Services

To stop all services, press:
```bash
Ctrl + C
```
in each terminal window.

---

### 🧭 Optional: Reinitialize Databases

If you want to reset the databases:
- Delete `src/catalog-service/data/catalog.db`
- Delete `src/order-service/data/orders.db`
Then rerun the services to auto-generate fresh databases.


