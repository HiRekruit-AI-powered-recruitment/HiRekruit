# Sign In and Sign Up Flow

This document provides a high-level overview of how the Sign In and Sign Up features are implemented across the HireMate application.

## Frontend Flow

The frontend relies on an "Optimistic Authentication" pattern to ensure a lightning-fast user experience without sacrificing security.

*   **State Management (`AuthContext.jsx`)**: This is the core authentication brain of the frontend. It uses React Context to provide authentication state globally. Upon loading, it instantly reads the user's login status and data from the browser's Local Storage. This allows the app to bypass initial loading screens. Simultaneously, it sends a background request to the backend to securely verify the session. If the session has expired, it quietly logs the user out.
*   **Navigation & UI (`Navbar.jsx`)**: This component listens to the global authentication context. Because the context is initialized instantly from Local Storage, the Navbar immediately renders either the "Sign In / Sign Up" buttons or the user's profile dropdown without any flashing loading states or delays.
*   **User Forms (`SignIn.jsx` & `SignUp.jsx`)**: These files contain the form interfaces where users enter their credentials. Upon a successful backend response, they trigger the context functions to save the session data into Local Storage and navigate the user to their dashboard.
*   **Route Protection (`ProtectedRoute.jsx`)**: This component wraps secure areas of the application. It checks the global authentication state; if a user attempts to access a protected page while not logged in, they are immediately redirected to the sign-in page.

## Backend Flow

The backend acts as the single source of truth for user security, credentials, and session validity.

*   **API Routing (`user_routes.py`)**: This file defines all the authentication endpoints (such as login, signup, session verification, and logout). It acts as the gateway, catching incoming requests from the frontend and forwarding them to the correct logic handler.
*   **Business Logic (`auth_controller.py`)**: This file executes the actual authentication operations. It handles hashing and validating passwords, checking if newly registered users are approved by an admin, generating secure authentication tokens/cookies upon a successful login, and clearing those sessions upon logout.
*   **Session Verification**: When the frontend performs its background check, a specific endpoint here verifies the provided token or cookie against the database and responds with the current user's profile data, confirming the session is still active and valid.
