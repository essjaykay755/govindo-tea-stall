## 1. Project Overview

- **Purpose:**  
  Build a mobile-first Next.js app to track daily attendance for two sections:
  - **Adda (Hangout)**
  - **Carrom** (with predefined players and partner assignments)

- **Key Features:**  
  - **Attendance Tracking:** Separate forms/pages for Adda and Carrom attendance.
  - **Partner Management:** Automatically assign and display carrom partners for each date so users know who to play with.
  - **Public View:** Publicly accessible list of all members and their partner assignments.
  - **Calendar & History:** Datewise history view with a calendar, displaying attendance summaries, partner assignments, and a placeholder for daily photos.
  - **Carrom Tournament:** A dedicated section labeled “Coming Soon” for future tournament features.
  - **Admin Panel:** Accessible only to the admin (essjaykay755@gmail.com) for manual partner assignment on any day and to upload photos.
  - **Authentication:** Use Supabase’s Google sign in for user authentication and partner assignment management.

---

## 2. Tech Stack

- **Frontend:**  
  - **Next.js:** Mobile-first React framework for building fast, scalable web apps.
  - **Tailwind CSS (or similar):** For responsive, mobile-first UI design.

- **Backend:**  
  - **Supabase:**  
    - **Database:** PostgreSQL for storing attendance records, predefined players, partner assignments, photo history, and admin controls.
    - **Authentication:** Google sign in integration.
    - **Storage:** For managing photo uploads and serving them in the history view.

- **Other Components:**  
  - **Calendar Component:** (e.g., react-calendar) to facilitate datewise history navigation.

---

## 3. Database & Data Model (Supabase)

- **Users Table:**  
  Store authenticated user data (from Google sign in).

- **Attendance Table:**  
  Fields:  
  - `id`
  - `date`
  - `section` (Adda or Carrom)
  - `user_id`
  - Timestamp, etc.

- **Carrom_Players Table:**  
  Predefined list of carrom players (fields: `id`, `name`, etc.)

- **Partner_Assignments Table:**  
  Stores pairing information for carrom on a given date (fields:  
  - `id`
  - `date`
  - `player1_id`
  - `player2_id`
  - etc.)

- **Photo_History Table:**  
  Links each date with its photo placeholder or uploaded photo.

- **Tournament Table (Optional):**  
  Structure reserved for future tournament details.

---

## 4. Application Pages & Routing

- **Home Page:**  
  Overview of the app with navigation links to major sections.

- **Attendance Page:**  
  - Two tabs or sub-pages:
    - **Adda Attendance:** Form for hangout attendance.
    - **Carrom Attendance:** Form that displays predefined players and, upon marking attendance, triggers partner assignments.

- **Calendar/History Page:**  
  - A calendar view to select dates.
  - Displays attendance summaries, partner assignments, and the placeholder or uploaded photo for that day.

- **Members/Partners Page:**  
  - Publicly accessible list detailing all members and the partner pairings for each date.

- **Carrom Tournament Page:**  
  - A placeholder page stating “Coming Soon” for future tournament features.

- **Admin Panel:**  
  - **Access Control:**  
    - Only accessible to the admin (verified via Google sign in, checking if the email equals `essjaykay755@gmail.com`).
  - **Features:**  
    - **Manual Partner Assignment:** Ability to adjust or reassign carrom partners for any selected day.
    - **Photo Upload:** Upload and link a photo for a particular date (stored in Supabase Storage and referenced in the Photo_History table).
  - **Navigation:**  
    - This panel can be a separate protected route (e.g., `/admin`) that is hidden from regular users.

---

## 5. User Authentication

- **Google Sign In:**  
  - Integrate Supabase Auth for user authentication.
  - Ensure that only authenticated users can mark attendance and generate partner pairings.
  - **Admin Check:**  
    - Implement a check (e.g., middleware or within the admin panel component) to verify if the signed-in user’s email is `essjaykay755@gmail.com` to grant access to the admin panel.

---

## 6. Development Phases

### **Phase 1: Setup & Configuration**
- **Initialize Project:**  
  - Set up a new Next.js project.
  - Configure Tailwind CSS for mobile-first styling.
- **Supabase Setup:**  
  - Connect your project with Supabase and configure environment variables.

### **Phase 2: Authentication**
- **Implement Google Sign In:**  
  - Use Supabase’s authentication module to integrate Google sign in.
  - Create login/logout components and protected routes for attendance marking and the admin panel.
- **Admin Verification:**  
  - In the authentication flow, include logic to check if the signed-in user is the admin (using `essjaykay755@gmail.com`).

### **Phase 3: Database & API Integration**
- **Database Schema:**  
  - Create the necessary tables in Supabase (Users, Attendance, Carrom_Players, Partner_Assignments, Photo_History).
- **API Routes/Direct Integration:**  
  - Build Next.js API routes or use direct Supabase client integration for CRUD operations, including endpoints for admin actions like manual partner assignments and photo uploads.

### **Phase 4: UI Development**
- **Attendance Forms:**  
  - Build separate forms/components for Adda and Carrom attendance.
- **Partner Assignment Logic:**  
  - Develop logic to automatically assign partners, with an option for the admin to manually override assignments.
- **Calendar Component:**  
  - Integrate a calendar view to allow users to navigate through dates and see historical data.
- **Public Members Page:**  
  - Create a public-facing page to list members and daily partner assignments.
- **Photo Placeholder & Upload:**  
  - Design and implement a component for displaying and uploading photos.
- **Admin Panel:**  
  - Develop an admin dashboard with:
    - A date picker for selecting the day.
    - Forms for adjusting partner assignments.
    - An upload widget for adding a photo to the selected date.
  - Ensure that the admin panel is accessible only when the authenticated user’s email matches `essjaykay755@gmail.com`.

### **Phase 5: Testing & Deployment**
- **Testing:**  
  - Verify authentication, attendance recording, partner assignment logic (both automatic and manual), and mobile responsiveness.
  - Test admin functionalities, ensuring that only the admin can access the panel.
- **Deployment:**  
  - Deploy your app on a platform like Vercel and ensure all environment variables for Supabase are correctly set up.

---

## 7. Future Enhancements

- **Carrom Tournament Feature:**  
  - Develop full tournament management features when ready.
- **Admin Interface Improvements:**  
  - Enhance the admin dashboard with analytics and reporting features.
- **Notifications & Reminders:**  
  - Implement notifications for upcoming events or tournaments.
- **Enhanced Media Management:**  
  - Expand photo handling capabilities (e.g., gallery view, image editing).
