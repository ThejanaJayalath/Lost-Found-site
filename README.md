# Lost & Found LK – Community Item Finder

A bilingual/trilingual platform where Sri Lankans can report, search, and recover lost or found items like ID cards, wallets, pets, bikes, or documents.

This document is a practical, step-by-step guide to help you learn React, Spring Boot, and MongoDB by building a real project with clean architecture, good coding style, and production-minded practices.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
  - [Frontend Setup (React + Vite + Tailwind + i18n)](#frontend-setup-react--vite--tailwind--i18n)
  - [Backend Setup (Spring Boot + MongoDB + JWT)](#backend-setup-spring-boot--mongodb--jwt)
  - [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Domain & Data Model](#domain--data-model)
- [API Design](#api-design)
- [Security](#security)
- [Frontend Application Structure](#frontend-application-structure)
- [Search & Filtering](#search--filtering)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Coding Standards](#coding-standards)
- [Learning Tips](#learning-tips)

---

## Overview
- Users can:
  - Post Lost or Found item notices
  - View and search other posts by category, date, or area
  - Contact the poster
  - Switch between Sinhala, Tamil, and English easily
- MVP targets clean, maintainable code and a layered architecture suitable for learning and extending.

## Tech Stack
- Frontend: React 18+, TypeScript 5+, Vite, Tailwind CSS, React Router, React Query, i18next
- Backend: Spring Boot 3.3+, Java 21, Spring Data MongoDB, Spring Security (JWT), Bean Validation
- Database: MongoDB Atlas
- Auth: JWT (access + refresh), httpOnly cookies recommended
- Images (optional): Cloudinary or Firebase Storage
- Deploy: Frontend (Vercel/Netlify), Backend (Render/Railway), DB (MongoDB Atlas)

## Architecture
- SPA frontend consumes a REST API.
- Backend is stateless; JWT-based auth; CORS-enabled.
- MongoDB holds users and posts; optional text and geospatial indexes for search.
- i18n handled on frontend with i18next; language preference stored in localStorage.

High-level layers:
- Frontend: UI components, feature modules, API client, i18n
- Backend: Controllers (REST), Services (business), Repositories (MongoDB), Security (JWT), Config (CORS, validation)

## Repository Layout
- Beginner-friendly approach: two separate repositories (or folders) within a parent directory.
  - `lost-and-found-lk-frontend`
  - `lost-and-found-lk-backend`

You can also keep both inside this workspace as sibling folders.

## Prerequisites
- Node.js 20+
- Java 21
- Git
- MongoDB Atlas account

## Environment Variables
Backend (`application.properties` or `application.yml`):
- `spring.data.mongodb.uri`
- `jwt.secret` (strong Base64 string)
- `jwt.access.ttl` (e.g., `15m`)
- `jwt.refresh.ttl` (e.g., `7d`)
- `app.cors.allowedOrigins` (comma-separated allowed origins)
- Optional Cloudinary: `cloudinary.cloudName`, `cloudinary.apiKey`, `cloudinary.apiSecret`

Frontend (`.env`):
- `VITE_API_URL=https://your-backend-host/api`

Never commit real secrets.

---

## Quick Start

### Frontend Setup (React + Vite + Tailwind + i18n)
1) Create project
```bash
npm create vite@latest lost-and-found-lk-frontend -- --template react-ts
cd lost-and-found-lk-frontend
```

2) Install dependencies
```bash
npm i react-router-dom axios @tanstack/react-query i18next react-i18next
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3) Configure Tailwind
- In `tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```
- In `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4) i18next initialization (example)
- `src/features/i18n/i18n.ts`:
```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import si from "./locales/si.json";
import ta from "./locales/ta.json";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, si: { translation: si }, ta: { translation: ta } },
  lng: localStorage.getItem("lang") ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
export default i18n;
```
- Add sample locale files: `src/features/i18n/locales/en.json`, `si.json`, `ta.json`.

5) API client with refresh
- `src/lib/apiClient.ts`:
```ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !error.config.__isRetryRequest) {
      try {
        await api.post("/auth/refresh");
        (error.config as any).__isRetryRequest = true;
        return api.request(error.config);
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);
```

6) Run dev server
```bash
npm run dev
```

### Backend Setup (Spring Boot + MongoDB + JWT)
1) Create project with Spring Initializr
- Dependencies: Web, Validation, Security, Spring Data MongoDB, Lombok
- Optional: Actuator, DevTools
- JWT libs (if using JJWT):
  - `io.jsonwebtoken:jjwt-api`
  - runtime: `io.jsonwebtoken:jjwt-impl`, `io.jsonwebtoken:jjwt-jackson`

2) Example Gradle Kotlin dependencies (`build.gradle.kts`)
```kotlin
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

  implementation("io.jsonwebtoken:jjwt-api:0.11.5")
  runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
  runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

  compileOnly("org.projectlombok:lombok")
  annotationProcessor("org.projectlombok:lombok")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
}
```

3) MongoDB connection (`application.properties`)
```
spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

4) CORS configuration (example Java bean)
```java
@Bean
CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowedOrigins}") List<String> origins) {
  var config = new CorsConfiguration();
  config.setAllowedOrigins(origins);
  config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("Content-Type","Authorization"));
  config.setAllowCredentials(true);
  var source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", config);
  return source;
}
```

5) Security configuration (JWT, stateless)
```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http
    .csrf(csrf -> csrf.disable())
    .cors(Customizer.withDefaults())
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(auth -> auth
      .requestMatchers("/api/auth/**").permitAll()
      .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
      .anyRequest().authenticated()
    )
    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
  return http.build();
}
```

6) Run backend
```bash
./gradlew bootRun
# or
./mvnw spring-boot:run
```

### MongoDB Atlas Setup
- Create a free cluster.
- Create a database user and password.
- Add your IP (or 0.0.0.0/0 for dev) to the IP allowlist.
- Copy your connection string and put it in `spring.data.mongodb.uri`.

---

## Domain & Data Model
- User
  - `id`, `email` (unique), `passwordHash`, `name`, `role` (`USER`, `ADMIN`), `createdAt`
- Post
  - `id`, `title`, `description`, `type` (`LOST`, `FOUND`), `category` (`ID_CARD`, `PET`, `WALLET`, ...), `imageUrl`, `locationText`, `coordinates` (optional GeoJSON later), `date`, `contact` (name, phone, email), `userId`, `createdAt`, `updatedAt`

Indexes
- Posts: compound `{ type, category, date }`, text index on `title` + `description`, optional 2dsphere on `coordinates`.

DTOs
- Auth: `RegisterRequest`, `LoginRequest`, `AuthResponse`
- Posts: `CreatePostRequest`, `UpdatePostRequest`, `PostResponse`, `PageResponse<T>`

Validation
- Use Bean Validation: `@NotBlank`, `@Email`, `@Size`, `@Pattern`.
- Add a global `@ControllerAdvice` to return consistent error JSON.

---

## API Design
Auth
- `POST /api/auth/register` – create user
- `POST /api/auth/login` – set access/refresh cookies and return profile
- `POST /api/auth/refresh` – rotate tokens
- `POST /api/auth/logout` – clear cookies

Posts
- `GET /api/posts` – list with filters: `type`, `category`, `q`, `location`, `from`, `to`, `page`, `size`, `sort`
- `GET /api/posts/{id}` – get one
- `POST /api/posts` – create (auth required)
- `PUT /api/posts/{id}` – update (owner or admin)
- `DELETE /api/posts/{id}` – delete (owner or admin)

Pagination response (example)
```json
{
  "items": [],
  "page": 0,
  "size": 10,
  "totalItems": 0,
  "totalPages": 0
}
```

Global error format (example)
```json
{
  "timestamp": "2025-10-31T12:00:00Z",
  "status": 400,
  "error": "ValidationError",
  "message": "title: must not be blank",
  "path": "/api/posts"
}
```

---

## Security
- JWT with short-lived access token (e.g., 15m) and refresh token (e.g., 7d)
- Store tokens in httpOnly cookies with `Secure; SameSite=Strict`
- `BCryptPasswordEncoder` for password hashing
- Stateless sessions: disable CSRF (or configure appropriately)
- Limit login attempts and consider rate-limiting later
- CORS: whitelist frontend domain; allow credentials

---

## Frontend Application Structure
Suggested folders:
```
src/
  app/          # providers: router, query client, i18n
  components/   # shared UI
  features/
    auth/       # api, hooks, components
    posts/      # api, hooks, pages, components
    i18n/       # resources, init
  pages/        # Home, PostList, PostDetail, CreatePost, EditPost, Login, Register
  lib/          # apiClient.ts, storage.ts, date.ts
  types/        # DTOs
  styles/
```

Routing
- Public: Home, Post list/detail
- Private: Create/Edit/Delete Post (via route guard)

Language Switcher (example React component)
```tsx
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const change = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };
  return (
    <div className="flex gap-2">
      <button onClick={() => change("si")}>සිං</button>
      <button onClick={() => change("ta")}>தமிழ்</button>
      <button onClick={() => change("en")}>EN</button>
    </div>
  );
};
```

API Client Tips
- Use Axios with `withCredentials: true` for cookie-based auth
- Use response interceptors to refresh tokens on 401
- Use React Query for server state, with cache keys per filter

UI/UX Tips
- Accessible forms with labels
- Mobile-first responsive layout
- Badges for `LOST` vs `FOUND`
- Loading/empty/error states

---

## Search & Filtering
Backend supports:
- `type`: `LOST|FOUND`
- `category`: `ID_CARD|PET|WALLET|...`
- `q`: text search on title/description (Mongo text index)
- `location`: fuzzy match on `locationText`
- `from`/`to`: date range
- `page`/`size`/`sort`: pagination/sorting

Frontend UI:
- Filter bar with dropdowns and date pickers
- Preserve filters in query params; shareable URLs

---

## Testing
Backend
- Unit tests for services (Mockito)
- Web layer tests with `@WebMvcTest`
- Security tests: protected endpoints return 401 without JWT
- Repository tests: embedded Mongo or Testcontainers (advanced)

Frontend
- React Testing Library + Vitest
- Test forms, language switcher, route guards

---

## Deployment
Backend (Render/Railway)
- Build: `./gradlew bootJar`
- Start: `java -jar build/libs/<your-app>.jar`
- Set env vars (Mongo URI, JWT secret, CORS origins)
- Enable HTTPS on the platform

Frontend (Vercel/Netlify)
- Build: `npm run build`
- Output: `dist`
- Set `VITE_API_URL` to backend URL
- Configure SPA fallback to `index.html`

MongoDB Atlas
- Keep IP allowlist updated
- Use SRV connection strings

---

## Roadmap
MVP
- Auth (register/login/logout/refresh)
- Create/View/Edit/Delete posts
- Search + filters + pagination
- i18n (Sinhala, Tamil, English)
- Optional image upload

Later
- Google Maps (show location)
- Admin moderation (flag/verify)
- Comments/Chat (WebSocket)
- Geospatial search (2dsphere)
- Rate limiting and captcha

---

## Coding Standards
General
- TypeScript strict mode, meaningful names, small modules
- Conventional Commits (`feat:`, `fix:`, `chore:`)
- Prettier + ESLint (frontend), Checkstyle/Spotless (backend)

Backend
- Package by feature (`auth`, `posts`)
- DTOs at API boundaries; keep entities internal
- Thin controllers, business logic in services
- Validate inputs; consistent error format
- Use pagination for lists

Frontend
- Co-locate feature files; custom hooks for data fetching
- Separate presentational vs. container components
- Avoid prop drilling; use context sparingly
- Tailwind for styles; extract reusable UI components

---

## Learning Tips
- Build vertically: backend route → frontend call → UI
- Start simple: localStorage tokens if cookies are complex, then upgrade
- Keep a Postman/Insomnia collection for API testing
- Add small tests as you build features—consistency beats perfection

---

## License
Add your preferred license (e.g., MIT) here.

---

## Credits
Built as a learning project to practice React, Spring Boot, and MongoDB with multilingual support.


