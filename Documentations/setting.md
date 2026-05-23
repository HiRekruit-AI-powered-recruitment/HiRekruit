# Settings and Feedback Flow

This document provides a high-level overview of how the Settings and User Feedback features are implemented across the HireMate application for both standard users and administrators.

## Frontend Flow

The frontend handles capturing user preferences and feedback, while providing a dedicated interface for administrators to review incoming feedback.

*   **User Interface (`Settings.jsx`)**: This is the central hub for users to view and update their profile details (such as Name, Email, Phone, Company) and submit feedback. It provides a clean, tabbed interface. When the "Feedback" tab is selected, it presents a form to submit suggestions or bug reports. It relies on the global Authentication context to automatically attach the logged-in user's identity to the feedback submission.
*   **Admin Dashboard Integration (`AdminLayout.jsx` & `AdminSidebar.jsx`)**: The administrative area includes a persistent sidebar navigation. A dedicated "Feedback" route is integrated here to allow admins quick access to the feedback management view.
*   **Admin Feedback Management (`AdminFeedback.jsx`)**: This component acts as the control panel for administrators. It fetches all submitted feedback from the backend and displays it in an organized table. It features live search filtering across all text fields and pagination. Crucially, it allows admins to easily toggle the status of any feedback between "Pending" and "Resolved" directly from the table interface.

## Backend Flow

The backend manages the secure storage of user preferences and acts as the persistent layer for the feedback tracking system.

*   **Data Models (`Feedback.py`)**: This file defines the schema structure for feedback entries stored in the database. It enforces that every feedback submission records the user's ID, name, email, company, the message itself, and a status tracking flag (defaulting to "pending"), along with creation timestamps.
*   **API Routing (`settings_routes.py`)**: This file registers the endpoints under the `/api/settings/` prefix. It routes incoming requests for submitting new feedback, retrieving all feedback, and updating feedback statuses to the appropriate controller functions.
*   **Business Logic (`settings_controller.py`)**: This controller contains the core execution logic:
    *   **Submission**: Validates incoming feedback data from the frontend and inserts a new formatted document into the database.
    *   **Retrieval**: Queries the database to fetch all feedback, sorting them chronologically to show the newest submissions first. It prepares and sanitizes the data structure for the Admin dashboard.
    *   **Status Update**: Receives requests from admins to update specific feedback entries, modifying their status flag between "pending" and "resolved" directly in the database.
