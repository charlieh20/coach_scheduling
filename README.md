# Coach Scheduling App

## Overview


### Frontend

The frontend of this app uses React with Typescript. Due to time constraints and for design simplicity, it is a single page app. The libray `react-semantic-ui` was used throughout for all styling.

### Backend

The backend of this app was constructed with Express.js. There are 8 endpoints used for the frontend to interact with the database.

### Database

This app uses a PostgreSQL database. There are three tables with the following column setups:

1. Users:
    - id - integer (primary key)
    - name - VARCHAR(255)
    - phone - VARCHAR(16)
    - role - ENUM('student', 'coach')
2. Slots
    - id - integer (primary key)
    - coach_id - integer (foreign key)
    - student_id - integer (foreign key)
    - start_time - timestamp
3. Reviews:
    - id - integer (primary key)
    - slot_id - integer (foreign key)
    - score - integer
    - note - text

## Features

This app has all the specified features below:
1. Coaches can add slots of availability to their calendars. These slots are always 2 hours long and each slot can be booked by exactly 1 student.
2. Coaches can view their own upcoming slots.
3. Students can book upcoming, available slots for any coach.
4. When a slot is booked, both the student and coach can view each other’s phone-number.
5. After they complete a call with a student, coaches will record the student’s satisfaction (an integer 1-5) and write some free-form notes.
6. Coaches should be able to review their past scores and notes for all of their calls.

Some additional features are added for robustness testing simplicity:
- The current user can be switched by entering a new user's name into an input in the fixed header at the top of the page.
- Each list uses pagination for design improvement and robustness.
- Coaches cannot have overlapping appointments.

## Future development

Here are some improvements I would make with more time:
- Giving coaches the ability to delete/edit appointments.
- Ensuring students can't have overlapping appointments.
- Adding unit tests.
- Commenting code more thoroughly.
