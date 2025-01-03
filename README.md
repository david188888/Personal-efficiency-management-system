# Project Title

**Web Application for Software System Design and Artitecture Assignment**


---

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Start the Services](#3-start-the-services)
- [Usage](#usage)
  - [Logging In](#logging-in)
  - [Account Information](#account-information)
- [Contact](#contact)

---

## Project Overview

This project is a full-stack web application developed as part of a group assignment for the Software System Design and Artitecture course. The application demonstrates the integration of a React front end with a Flask back end and a MySQL database, providing a seamless user experience with robust data management.

---

## Technologies Used

- **Front End:** React
- **Back End:** Flask (Python)
- **Database:** MySQL
- **Version Control:** Git

---

## Installation

Follow the steps below to set up the project locally.

### 1. Clone the Repository

First, clone the project repository to your local machine using Git (using SSH):
```bash
git clone git@github.com:david188888/Personal-efficiency-management-system.git
```
### 2. Install Dependencies

#### Front End

Navigate to the root directory and install the necessary packages using `npm`:

```bash
cd Personal-efficiency-management-system
npm install
```

#### Back End

Install the required Python packages using `pip`:

```bash
pip install -r requirements.txt
```

#### Database

1. **Install and configure MySQL service**

Make sure that the MySQL service has been installed and started in your system. You can refer to the [MySQL official documentation](https://dev.mysql.com/doc/) for installation and configuration.

2. **Create a database**

Open a terminal and log in to MySQL:

```bash
mysql -u your_mysql_username -p
```

After entering the password, create a database named `taskmanage`:

```sql
CREATE DATABASE taskmanage;
```

3. **Configure database connection**

Open the `backend/password.py` file and change `username` and `password` to your own MySQL account and password:

```python
username = 'your_mysql_username'
password = 'your_mysql_password'
```

### 3. Start the Services

#### Front End

Start the React front-end service:

```bash
npm start
```

This will launch the front-end application, typically accessible at `http://localhost:3000`.

#### Back End

In a separate terminal window, navigate to the back-end directory and start the Flask server:

```bash
cd backend
python app.py
```

The back-end service will run on `http://localhost:8080` by default.

---

## Usage

### Logging In

1. Open your web browser and navigate to the front-end application (e.g., `http://localhost:3000`).
2. You will be presented with the login page.
3. Register for your account
4. Login with your account

### Tips

- **We automatically insert some preset tasks when you register as a user. The purpose of this is to allow you to experience our task management visualization function more intuitively.**
- **Since the react service is running on localhost, you may need to refresh the page to get updated content.**
- **The visualization should be like this when you enter the website with new account. (You could refresh the website if you could not see the visualization):**
![visualization](photo.png)
---

## Contact

For any questions or feedback, please contact:

- **Name:** David
- **Email:** david.liu1888888@gmail.com


---

