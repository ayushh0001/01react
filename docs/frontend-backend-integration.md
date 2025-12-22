
---

# 📑 Full Developer Document (Short Explanation Version)

```markdown
# ZPIN – Frontend & Backend Integration Guide

## 1. Overview
ZPIN is a full-stack app combining **React (Vite)** and **Node.js + Express + MongoDB**. It uses **JWT authentication** and **Axios** for API communication. GitHub multi-branch workflow ensures safe parallel development.

---

## 2. Repository Structure
Frontend (`src/`) handles UI, API calls, and auth context.  
Backend (`backend/`) manages routes, controllers, models, and middleware.  
Docs (`docs/`) contain integration details.

---

## 3. Branch Strategy
- `main` → stable code  
- `feature/fetch-api` → frontend work  
- `api/contract/docs` → backend work  

Parallel development was possible without breaking production.

---

## 4. Setup
- **Frontend:** `npm install && npm run dev` → runs on `http://localhost:5173`  
- **Backend:** `cd backend && npm install && npm run dev` → runs on `http://localhost:5000`  

`.env` file required for backend (Mongo URI + JWT secret).

---

## 5. API Base URL
Centralized in `src/api/axios.instance.js`.  
JWT token automatically added to headers via interceptor.

---

## 6. Authentication Flow
- **Signup:** Save user → Generate JWT → Phone verification  
- **Login:** Validate → Issue JWT → Redirect to dashboard  

Auth state managed globally in `AuthContext`.

---

## 7. Protected Routes
`ProtectedRoute.jsx` ensures only authenticated users can access dashboard routes.

---

## 8. Common Issues
- CORS → Enable in backend  
- Missing `.env` → Add required variables  
- Enum mismatch → Fix schema values  
- Wrong API URL → Correct frontend/backend routes  
- AuthContext null → Wrap `<App />` in `<AuthProvider />`

---

## 9. Git Workflow
Use **stash** before switching branches.  
Commit and push changes to feature branches.  
Merge into `main` only after testing.

---