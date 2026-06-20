# 🌿 Cold Storage E-Commerce Website

A full-stack e-commerce web app for a fictional cold-storage organic produce brand — built as a personal portfolio project to demonstrate front-end UI craft, Firebase integration, and a complete shopping flow from browsing to checkout to order tracking.

**🔗 Live Demo:** _add your deployed link here (e.g. Vercel / Netlify / Firebase Hosting)_

---

## 📖 About

Fresh & Organic Cold Storage simulates a real online grocery store specializing in cold-stored, organic fruits and vegetables. It's built entirely with vanilla HTML, CSS, and JavaScript on the front end, backed by Firebase for authentication and data storage — no frameworks, no backend server.

This project was built to practice and showcase:
- Real-world e-commerce UX patterns (cart, checkout, order tracking, profile management)
- Firebase Authentication (Email/Password + Google Sign-In)
- Cloud Firestore as a NoSQL database for products, users, and orders
- Responsive, accessible UI design with a consistent dark theme
- State management in vanilla JS without any front-end framework

---

## ✨ Features

- **🔐 Authentication** — Email/password and Google sign-in via Firebase Auth, with protected routes for cart, checkout, orders, and profile pages
- **🛒 Product Catalog** — Browse vegetables, fruits, and fresh products with live Firestore data, price filtering, sorting, and search
- **📄 Product Details** — Individual product pages with nutrition info, storage tips, freshness score, and related products
- **🛍️ Shopping Cart** — Add/remove items, adjust quantities, apply coupon codes (`FRESH10`, `ORGANIC20`, `SAVE50`), live price breakdown
- **💳 Checkout** — Multiple payment methods (UPI with app selection, Credit/Debit Card with live preview, Pay in 3 instalments, Cash on Delivery with surcharge), saved address management synced with profile
- **📦 Order Tracking** — Flipkart-style live order status timeline (Order Placed → Confirmed → Packed → Out for Delivery → Delivered), filterable by status
- **👤 Profile Management** — Edit account details, manage saved addresses, change password, view order/spending stats
- **⭐ Testimonials & Features Pages** — Static content pages with consistent dark theme and responsive layout
- **📱 Fully Responsive** — Works across mobile, tablet, and desktop using Bootstrap 5's grid system

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript ES6 |
| Authentication | Firebase Authentication (Email/Password, Google OAuth) |
| Database | Cloud Firestore |
| Development Tools | VS Code, Git & GitHub |

---

## 📂 Project Structure

```
Cold-Storage-Ecommerce
│
├── img
│   ├── fresh
│   ├── fruits
│   ├── vegetables
│   └── icon
│
├── js
│   ├── main.js
│   └── navbar.js                               # Shared navbar component + auth state
│
├── index.html                                  # Home page
├── about.html                                  # About page
├── feature.html                                # Features/why-choose-us page
├── products.html                               # Product listing with filters/search
├── product.html                                # Single product detail page
├── cart.html                                   # Shopping cart
├── checkout.html                               # Checkout with payment methods
├── orders.html                                 # Order history & tracking
├── profile.html                                # User profile & address management
├── login.html                                  # Login page
├── register.html                               # Registration page
├── testimonial.html                            # Customer testimonials page
├── contact.html                                # Contact page
│
└── README.md
```

---

## 🔥 Firebase Setup

This project uses Firebase for Authentication and Firestore. To run it with your own Firebase project:

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password and Google sign-in providers
3. Enable **Cloud Firestore** in production or test mode
4. Copy your Firebase config and replace the `firebaseConfig` object in each HTML file (or centralize it in `js/navbar.js` if refactoring)
5. Seed the `products` collection with your product data (fields used: `name`, `price`, `unit`, `category`, `image`/`emoji`, `organic`, `seasonal`, `freshness`, `rating`, `reviews`, `description`, `nutrition`, `storageTipHome`, `storageTipConsume`, `minOrder`, `oldPrice`)
6. Set Firestore security rules to allow public reads and authenticated writes:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 Getting Started

No build tools or package manager required — this is a static site.

```bash
git clone https://github.com/Sujal-0803/cold-storage-ecommerce.git
cd cold-storage-ecommerce
```

Open `index.html` directly in a browser, or serve it locally for best results (ES module imports require a server context in some browsers):

```bash
# Using HTML
HTML5 -m http.server 5500
```

Then visit `http://localhost:5500`.

---

## 🙋 About the Developer

Built by **Sujal Maru** — a fresher developer based in Pune, Maharashtra, as a personal portfolio project to practice full-stack-feeling web development using Firebase as a backend-as-a-service.

- 🔗 GitHub: [Sujal-0803](https://github.com/Sujal-0803)
- 💼 LinkedIn: [sujalmaru0803](https://www.linkedin.com/in/sujalmaru0803)
- 📧 Email: sujalmaru2004@gmail.com

---

## 📄 License

This project is open source and available for learning purposes. Feel free to fork and adapt it for your own portfolio.

---

| 🚀 Built With ❤️ By Sujal Maru | Cold Storage E-Commerce Website 2026
