# DeskHero

## Project Description
DeskHero is a modern, efficient desk booking system designed to streamline the process of reserving desks in an office environment. The application allows employees to quickly reserve desks, check availability, cancel reservations, and view their booking history—all with an intuitive user interface. Administrators can manage desks and cancel reservations for users, ensuring smooth operations in the workplace.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack
- **Frontend:**
  - Angular (with Angular Material and Angular CDK)
  - TypeScript
  - Sass
- **Backend:**
  - Java with Spring Boot
  - Spring Data, Spring Security
  - Lombok
  - PostgreSQL
- **CI/CD & Hosting:**
  - GitHub Actions for CI/CD pipelines
  - DigitalOcean for deployment via Docker

## Getting Started Locally
To run DeskHero on your local machine, follow these steps:

### Frontend Setup:
1. Ensure you have Node.js and npm installed.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Angular development server:
   ```bash
   npm start
   ```
   The application will be available at [http://localhost:4200](http://localhost:4200).

### Backend Setup:
1. Ensure you have Java (JDK 21 or later) and Gradle installed.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Build and run the backend application using Gradle:
   ```bash
   ./gradlew bootRun
   ```
   The backend service will start on the default port (typically 8080). Adjust the configuration as needed.

## Available Scripts

### Frontend (in `package.json`):
- **ng serve**: Run the Angular development server.
- **ng build**: Build the Angular application.
- **ng test**: Run tests using Karma.

Additionally, a server-side rendering (SSR) command is provided:
- **serve:ssr:deskhero**: Start the SSR version of the application.

### Backend (via Gradle):
- **bootRun**: Run the Spring Boot application.
- **test**: Execute the backend tests.

## Project Scope
DeskHero includes the following features:
- **User Registration & Login:** Users can register by providing email, name, and password. A JWT token valid for 24 hours is generated upon registration.
- **Desk Reservation:** Users can reserve a desk for a selected day via a weekly view interface, optimized for a seamless reservation process with a maximum of 5 clicks.
- **Reservation Cancellation:** Users can cancel their desk reservations at any time and receive a confirmation message.
- **Reservation History:** Users can view a list of upcoming and past reservations.
- **Guest Desk Availability:** Guests can view desk availability without logging in.
- **Administration:** Admins can manage desks (add, edit, delete) and cancel reservations for users.

## Project Status
This project is an MVP (Minimum Viable Product) designed for a training environment. It addresses core functionalities to prevent booking conflicts and streamline the desk reservation process. Future improvements and scalability enhancements are planned.

## License
This project is licensed under terms to be determined. Please consult the repository maintainers for more details. 
