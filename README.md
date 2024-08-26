# Movie Management Demo

## Description

Movies Management Demo Repository

## Website

- [API Documentation](https://movie-management-demo.onrender.com/api)
- [Project Root URL](https://movie-management-demo.onrender.com)

## Basic Functionalities

- **User and Role Management**
  - **Customer Users**: Log in, view, and update their profiles.
  - **Manager Users**: Create users, list all users, delete users, and view users by ID.
  - **Anonymous Users**: Can only sign up.

- **Movie Operations**
  - List movies with session filters, allow customers to buy tickets.
  - Watch movies during session times, view watch history.
  - Managers can manage movies (create, update, delete) and arrange sessions.

- **CRUD Operations**: Comprehensive CRUD functionality for movies and users.

- **RESTful Principles**: API adheres to RESTful principles.

- **Authentication and Authorization**
  - **Authentication**: Managed via JWT.
  - **Authorization**: Role-based access control is implemented.

- **Automatic Deployment**: Enabled via GitHub workflows.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

Unit tests cover most of the logic behind service files.
Controller/Guard/Filter tests are done via e2e tests
