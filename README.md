# FastAPI + React | Post Website

Demo: [https://dariulonepost.onrender.com](https://dariulonepost.onrender.com)

**Note**: Requests delay can reach up to 50 seconds.

## Features Implemented

- **Profile Page**: User profile with personal information and activity.
- **Likes and Comments**: Interactivity with posts through likes and comments.
- **WebSocket Notifications**: Real-time notifications via WebSockets.
- **User Subscriptions**: Ability to follow/unfollow users and view posts from subscribed users.
- **View Counter**: Tracks how many times a post has been viewed.
- **IP-based Post View Verification**: Post views are monitored and verified based on the viewer's IP.
- **Category Filter**: Filter posts by categories for easier navigation.
- **Light/Dark Theme**: Toggle between light and dark themes for better user experience.
- **Mobile Responsiveness**: Fully responsive design for optimal viewing on mobile devices.

## Technologies Used
- Frontend: React, Material UI, Ant.Design
- Backend: Python, FastAPI, PostgreSQL, Sqlite
    
## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dariulone/dariulonePosts
   ```

2. Install Python dependencies
   ```bash
   cd backend
   python3 -m venv .venv
   .venv\scripts\activate
   pip install -r requirements.txt
   ```
3. Run python terminal and js terminal
   ```bash
   cd frontend
   npm run dev
   ```

   ```bash
   cd backend
   uvicorn main:app --reload
   ```
4. Create .env in backend
   ```bash
    SECRET_KEY=""
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    ALLOWED_ORIGINS=http://localhost:3000
    DB_URL=""
    ```
5. Create .env in frontend
   ```bash
   VITE_API_URL=http://localhost:8000
   ```

## Screenshots
![dariulonepost onrender com_](https://github.com/user-attachments/assets/a6e70b73-d8c0-4112-8fd6-e54476b3533d)
![dariulonepost onrender com_ (2)](https://github.com/user-attachments/assets/f2f94b6e-6d1b-4bd4-b198-996a16720981)
![dariulonepost onrender com_ (3)](https://github.com/user-attachments/assets/74be7096-61bf-4e42-9b92-d54ba10ebaa2)
![dariulonepost onrender com_ (4)](https://github.com/user-attachments/assets/60c62c56-d02c-4428-9718-4628ac47cb80)
![dariulonepost onrender com_ (5)](https://github.com/user-attachments/assets/a38d0a32-2ef0-4a0a-883c-f270ce75a42a)
![dariulonepost onrender com_ (6)](https://github.com/user-attachments/assets/554d1edb-c593-41b6-a108-416d18548161)
![dariulonepost onrender com_ (7)](https://github.com/user-attachments/assets/7ead9616-1cee-4b3e-a54f-618a6f06e72e)
![dariulonepost onrender com_profile_2_](https://github.com/user-attachments/assets/08b101df-510c-4c2b-afb1-c50f7ad392e7)
![dariulonepost onrender com_profile_2_ (1)](https://github.com/user-attachments/assets/f45f571c-6abc-442f-8362-f9a76650f7b9)
![dariulonepost onrender com_profile_2_ (2)](https://github.com/user-attachments/assets/98ef7433-3a02-4770-8273-5a7beacbcc26)
![dariulonepost onrender com_ (1)](https://github.com/user-attachments/assets/85e8b98f-30b9-45d5-b07e-78358b3bee87)

