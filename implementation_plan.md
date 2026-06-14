# LOGOTIP Print & Graphics — MVP Application Specification

## 1. Project Goal

Develop a browser-based internal management application for a print & graphics business.

The MVP should allow employees to:

* manage customers
* create and track orders
* calculate prices based on predefined price lists
* manage order workflow through a Kanban dashboard
* upload order files
* manage users with separate accounts

The application must be designed so that future versions can expand into a full ERP system.

---

# 2. MVP Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

Purpose:

* responsive browser interface
* dashboard UI
* forms
* tables
* Kanban interface

## Backend

Use:

* Next.js API routes

No separate backend required for MVP.

The backend should expose APIs for:

* authentication
* users
* customers
* orders
* pricing
* files

## Database

Development:

* SQLite

ORM:

* Prisma ORM

The database structure must allow migration later to:

* PostgreSQL
* cloud database

## Authentication

Use:

* Auth.js

Requirements:

* login/logout
* user sessions
* role-based permissions

Roles:

```
ADMIN
EMPLOYEE
CUSTOMER (future)
```

---

# 3. Main MVP Features

# 3.1 User Management

Users must have individual accounts.

Database:

```
users

id
name
email
password_hash
role
created_at
```

Functions:

* login
* logout
* create users (admin only)
* disable users
* assign roles

---

# 3.2 Customer Management

Employees can manage customers.

Customer fields:

```
customers

id

name

company

phone

email

address

notes

created_at
```

Features:

* add customer
* edit customer
* view customer history
* see previous orders

---

# 3.3 Order Management

Core feature of the application.

Each order contains:

```
orders

id

customer_id

created_by

title

description

status

priority

deadline

total_price

created_at

updated_at
```

Order statuses:

```
NOU

ÎN LUCRU

AȘTEAPTĂ CLIENT

FINALIZAT

RIDICAT
```

Order features:

* create order
* edit order
* assign employee
* change status
* set deadline
* attach files
* add notes

---

# 3.4 Kanban Order Dashboard

Main employee dashboard.

Columns:

```
+----------------+
| NOU            |
+----------------+

+----------------+
| ÎN LUCRU       |
+----------------+

+----------------+
| AȘTEAPTĂ CLIENT|
+----------------+

+----------------+
| FINALIZAT      |
+----------------+

+----------------+
| RIDICAT        |
+----------------+
```

Requirements:

* drag & drop orders
* update status automatically
* show:

  * customer name
  * order title
  * deadline
  * priority
  * assigned user

Library:

* dnd-kit

---

# 3.5 Pricing System

The application must not have prices hardcoded.

Prices must exist in database.

Database:

```
products

id

category

subcategory

name

unit

base_price

active
```

Example:

```
category:
Printare

name:
Print color A4

unit:
pagina

base_price:
2.00
```

The system should allow:

* search product
* select quantity
* calculate total
* add products to order

---

# 3.6 Order Items

One order can contain multiple products.

Database:

```
order_items

id

order_id

product_id

quantity

price
```

Example:

Order:

```
Firma ABC

Produse:

500 buc cărți vizită
2 bannere
1 autocolant
```

---

# 3.7 File Uploads

Orders need attached files:

Examples:

* PDF
* JPG
* PNG
* AI
* SVG

Database:

```
files

id

order_id

filename

path

uploaded_by

created_at
```

MVP:

Store locally.

Future:

Move to:

* S3
* Cloudflare R2
* Supabase Storage

---

# 4. Application Pages

## Login

```
/login
```

---

## Dashboard

```
/dashboard
```

Contains:

* Kanban orders
* statistics
* recent activity

---

## Orders

```
/orders
```

Features:

* list orders
* search
* filters
* create order

---

## Order Details

```
/orders/:id
```

Contains:

* customer
* products
* price
* files
* notes
* history

---

## Customers

```
/customers
```

---

## Pricing

```
/pricing
```

Admin only.

Allows:

* add product
* edit price
* disable product

---

# 5. Database Relations

```
USER

 |

 |

ORDERS

 |

 |

CUSTOMER


ORDERS

 |

 |

ORDER_ITEMS

 |

 |

PRODUCTS


ORDERS

 |

 |

FILES
```

---

# 6. UI Requirements

Design:

* clean admin dashboard
* Romanian language
* desktop first
* responsive for tablet/mobile

Components:

* tables
* cards
* forms
* modals
* notifications
* filters

---

# 7. Development Requirements

Code quality:

* TypeScript everywhere
* reusable components
* clean folder structure
* Prisma migrations
* environment variables

Project structure:

```
app/

components/

lib/

prisma/

api/

public/

uploads/
```

---

# 8. MVP Development Order

## Phase 1

Setup:

* Next.js
* TypeScript
* Tailwind
* Prisma
* SQLite

---

## Phase 2

Authentication:

* users
* roles
* login

---

## Phase 3

Customers:

* CRUD
* customer history

---

## Phase 4

Orders:

* create order
* edit order
* status system

---

## Phase 5

Kanban:

* drag/drop
* workflow

---

## Phase 6

Pricing:

* import price list
* calculate totals

---

## Phase 7

Files:

* upload
* attach to orders

---

# 9. Future Features (Not MVP)

Possible extensions:

* customer portal
* online order submission
* automatic quotes
* invoices
* payments
* SMS/email notifications
* production scheduling
* inventory
* employee time tracking
* mobile app

---

# Final MVP Objective

A working internal web application where:

1. Employees login individually
2. Customers are stored
3. Orders are created
4. Orders move through production using Kanban
5. Prices are calculated from database
6. Files are attached to orders
7. Data is ready for future expansion
