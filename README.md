# Nasl Aftab

<p align="center">
  <img src="public/images/nasl-aftab-logo.jpg" alt="Nasl Aftab Logo" width="220">
</p>

<h3 align="center">A Modern E-Commerce Platform for Agricultural Products</h3>

<p align="center">
  A Laravel-based e-commerce platform built with React, Inertia.js, and MySQL.
</p>

---

## Overview

**Nasl Aftab** is an e-commerce web application designed to showcase and sell agricultural products, including barberry, saffron, and rose-related products.

The platform provides a product catalog, customer accounts, an administrative dashboard, and customer support features. It aims to provide a structured and user-friendly shopping experience while simplifying product and content management.

## Features

- **Product Catalog:** Browse products across different categories, with product details, pricing, stock information, and availability.
- **Product Management:** Administrative tools for adding, editing, and managing products.
- **Shopping Cart:** Add products to a shopping cart and manage selected items.
- **User Authentication:** Customer registration, login, and account management.
- **Favorites:** Save and manage favorite products.
- **Customer Support Chat:** Messaging between customers and administrators.
- **Comments & Reviews:** Commenting, replies, and reactions on products.
- **Stock Notifications:** Subscribe to notifications when unavailable products become available again.
- **Blog System:** Publish and manage articles through the administrative panel.
- **Admin Dashboard:** Manage products, articles, comments, and administrative accounts.

## Tech Stack

| Technology | Purpose |
|---|---|
| PHP 8.3+ | Backend development |
| Laravel 13 | Backend framework |
| MySQL / SQLite | Database |
| React 19 | Frontend development |
| TypeScript | Frontend type safety |
| Inertia.js 3 | Connecting Laravel and React |
| Tailwind CSS 4 | Styling |
| Vite 8 | Frontend build tooling |

## Architecture

Nasl Aftab uses Laravel as its backend framework and React for its frontend interface, connected through Inertia.js.

The application follows Laravel's MVC architecture, with dedicated controllers, models, middleware, policies, jobs, and notifications. Frontend pages and reusable components are organized within the React resources directory.

## Project Structure

```text
nasl-aftab/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   ├── Jobs/
│   ├── Notifications/
│   └── Policies/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── public/
│   └── images/
├── resources/
│   ├── css/
│   ├── js/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── lib/
│   └── views/
├── routes/
├── tests/
├── composer.json
└── package.json
```

## Installation

### Prerequisites

Make sure the following tools are installed:

- PHP 8.3 or later
- Composer
- Node.js and npm
- MySQL (if using MySQL)

### 1. Clone the repository

```bash
git clone https://github.com/hyper101101/nasl-aftab.git

cd nasl-aftab
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

### 4. Configure the database

The default `.env.example` configuration uses SQLite.

To use MySQL, update the database settings in your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nasl_aftab
DB_USERNAME=root
DB_PASSWORD=
```

Create the `nasl_aftab` database in MySQL before proceeding.

Alternatively, you can keep SQLite as your database driver.

### 5. Run database migrations

```bash
php artisan migrate
```

### 6. Install frontend dependencies

```bash
npm install --ignore-scripts
```

### 7. Create the storage symbolic link

```bash
php artisan storage:link
```

### 8. Run the application

Start the Laravel development server:

```bash
php artisan serve
```

In a separate terminal, start the Vite development server:

```bash
npm run dev
```

The application will be available at:

```text
http://127.0.0.1:8000
```

### Production Build

To generate optimized frontend assets:

```bash
npm run build
```

## Project Status

**Currently in development.**

The repository is being actively developed, and features and implementation details may evolve over time.

## Repository

[GitHub - Nasl Aftab](https://github.com/hyper101101/nasl-aftab)