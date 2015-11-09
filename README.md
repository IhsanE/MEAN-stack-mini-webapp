# CRUD App
 In this assignment, you will develop a simple profile system for users using NodeJS, MongoDB and Express, where users should be able to sign up and update their profiles. You may use Bootstrap or similar framework to help you style your application.

# Overview
## Implement a simple web application with both server side and client side components that:

1. Allows users to signup and create a profile
2. Allows users to login/log out
3. Allows users to update a profile picture and changes details on their profile (after log in)
4. Allows users to view a list of all users and their profiles
5. Allows administrators to delete and edit user profiles
6. Allows administrators to to track and view some users behaviours, such as which page the users are viewing most, users IP address, Users viewing device(Desktop/mobile, OS, Screen size etc.), user locations, and so on. (This list is minimal, you are encouraged to add more). This is an individual assignment, each student must complete and submit their own solution.

# Specification
## User Accounts

### There will be three different types of user accounts with different permission levels:

### Regular users
1. Can update their own account information
2. Can view a list of all users available in the system and view their profiles
### Administrative users
1. Has all the functionalities of a regular user
2. Can update and delete all regular users available in the system ○ Can view user behaviour.
### Super Administrative users
1. The first user in the database is automatically assigned Super Administrator privileges
Has all the functionalities of an administrative user
2. Can assign/unassign administrative privileges to another user
3. User profiles will include a minimum of the following fields (you can added more if you want)
..* email address (this is the uniquely identified field)
..* password (hidden to other users)
..* description (less than 500 characters)
..* profile image (cannot be empty, assign some default photo. you can also use gravatar) ● display name (does not have to be unique)

## Instructions:

1. Clone project, cd into /mini-webapp
2. sudo npm install
3. mongo a4 (Might need to start up mongod if not already running)
4. sudo server.js
