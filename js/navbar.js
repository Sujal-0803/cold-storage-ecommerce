/* ── navbar.js  ── inject navbar + handle Firebase auth state on every page ── */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBGxXVoJVRSdCmvL8DJZ5SJysLH8OcU9CQ",
    authDomain: "fresh-organic-6f341.firebaseapp.com",
    projectId: "fresh-organic-6f341",
    storageBucket: "fresh-organic-6f341.firebasestorage.app",
    messagingSenderId: "1020727069856",
    appId: "1:1020727069856:web:3cc4c4ec43c42084620dc5",
    measurementId: "G-J1Y3KM9P80"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

const PUBLIC_PAGES = [
    "index.html", "", "about.html", "feature.html",
    "testimonial.html", "contact.html",
    "login.html", "register.html", "signup.html",
    "products.html", "product.html"
];

const FULLY_PROTECTED_PAGES = [
    "cart.html", "checkout.html", "profile.html", "orders.html"
];

/* ── sync cart count ──
   Shows 0 when logged out (regardless of what's sitting in localStorage),
   and the real localStorage cart total when logged in. */
function syncCartCount(loggedIn) {
    if (!loggedIn) {
        document.querySelectorAll(".cart-count-badge").forEach(el => el.textContent = "0");
        return;
    }
    const cart  = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll(".cart-count-badge").forEach(el => el.textContent = total);
}

/* ── logout ── */
window.doLogout = function () {
    signOut(auth).then(() => {
        localStorage.removeItem("cart");
        localStorage.removeItem("couponDiscount");
        localStorage.removeItem("productDiscount");
        localStorage.removeItem("checkoutTotal");
        window.location.href = "login.html";
    });
};

/* ── toggle search box ── */
window.toggleSearch = function () {
    const box = document.getElementById("searchBox");
    if (!box) return;
    const isVisible = box.style.display === "block";
    box.style.display = isVisible ? "none" : "block";
    if (!isVisible) {
        const input = document.getElementById("searchInput");
        if (input) { input.focus(); input.select(); }
    }
};

/* ── requireLogin ── */
window.requireLogin = function (actionLabel) {
    if (window.__firebaseUser) return true;
    sessionStorage.setItem("loginRedirectFrom", window.location.href);
    _showLoginToast(actionLabel || "this action");
    setTimeout(() => { window.location.href = "login.html"; }, 1400);
    return false;
};

function _showLoginToast(action) {
    const existing = document.getElementById("toast");
    const msg = "Please login to " + action;
    if (existing) {
        const label = document.getElementById("toastMsg");
        if (label) label.textContent = msg;
        existing.style.opacity = "1";
        existing.style.transform = "translateY(0)";
        setTimeout(() => { existing.style.opacity = "0"; existing.style.transform = "translateY(12px)"; }, 2000);
        return;
    }
    let t = document.getElementById("_navLoginToast");
    if (!t) {
        t = document.createElement("div");
        t.id = "_navLoginToast";
        t.style.cssText = "position:fixed;bottom:28px;right:28px;background:#e53935;color:#fff;" +
            "padding:12px 20px;border-radius:8px;font-size:14px;display:flex;align-items:center;" +
            "gap:8px;z-index:9999;max-width:300px;box-shadow:0 4px 14px rgba(0,0,0,0.2);";
        t.innerHTML = '<i class="fa fa-lock me-2"></i><span id="_navLoginToastMsg"></span>';
        document.body.appendChild(t);
    }
    document.getElementById("_navLoginToastMsg").textContent = msg;
    t.style.opacity = "1";
    setTimeout(() => { t.style.opacity = "0"; }, 2000);
}

/* ── addToCart global intercept ── */
window.addEventListener("DOMContentLoaded", () => {
    if (typeof window.addToCart === "function") {
        const _original = window.addToCart;
        window.addToCart = function (...args) {
            if (!window.requireLogin("add items to cart")) return;
            _original.apply(this, args);
        };
    }

    Object.defineProperty(window, "addToCart", {
        configurable: true,
        get() { return this._addToCart; },
        set(fn) {
            this._addToCart = function (...args) {
                if (!window.requireLogin("add items to cart")) return;
                fn.apply(this, args);
            };
        }
    });

    document.addEventListener("click", e => {
        const btn = e.target.closest("[data-requires-login]");
        if (btn && !window.__firebaseUser) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.requireLogin(btn.dataset.requiresLogin || "continue");
        }
    }, true);
});

/* ================================================================
   SEARCH HANDLER
   - On products.html → calls handleSearch() directly (live filter)
   - On any other page → redirects to products.html?q=...
================================================================ */
window._navHandleSearch = function (val) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (currentPage === "products.html") {
        if (typeof window.handleSearch === "function") window.handleSearch(val);
    } else {
        if (val.trim()) window.location.href = "products.html?q=" + encodeURIComponent(val.trim());
    }
};

/* ── build navbar HTML ── */
function buildNavbar(user) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    /* Base links — always visible */
    const baseLinks = [
        { href: "index.html",       label: "Home"        },
        { href: "about.html",       label: "About"       },
        { href: "products.html",    label: "Products"    },
        { href: "feature.html",     label: "Features"    },
        { href: "testimonial.html", label: "Testimonial" },
        { href: "contact.html",     label: "Contact"     },
    ];

    /* No Orders link in navbar — user accesses orders from profile dropdown */
    const allLinks = baseLinks;

    /* ── nav links: tight spacing, 15px Inter 500 ── */
    const navLinks = allLinks.map(l => `
        <a href="${l.href}"
           class="nav-item nav-link ${currentPage === l.href ? 'active' : ''}"
           style="font-size:15px;font-weight:500;padding:1.1rem 0.7rem;
                  font-family:'Inter',sans-serif;letter-spacing:0.01em;">
            ${l.label}
        </a>`).join("");

    /* ── dropdown: cyan button — SM initials + name + arrow ── */
    const userName  = user ? (user.displayName || user.email.split("@")[0]) : '';
    const firstName = userName ? userName.split(" ")[0] : '';
    const initials  = firstName ? (firstName.charAt(0).toUpperCase() +
                      (userName.split(" ")[1] ? userName.split(" ")[1].charAt(0).toUpperCase() : '')) : '';
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00B4D8&color=0D1B2A&size=64&bold=true` : '';

    const userSection = user ? `
        <div class="dropdown">
            <button class="dropdown-toggle d-flex align-items-center gap-2"
                    style="padding:6px 14px 6px 8px;border-radius:10px;
                           background:#00B4D8;border:none;cursor:pointer;"
                    type="button" data-bs-toggle="dropdown"
                    data-bs-offset="0,8" aria-expanded="false">
                <div style="width:28px;height:28px;border-radius:50%;
                            background:#fff;display:flex;align-items:center;
                            justify-content:center;font-size:11px;font-weight:700;
                            color:#0D1B2A;flex-shrink:0;
                            font-family:'Space Grotesk',sans-serif;">
                    ${initials}
                </div>
                <span style="font-size:13px;font-weight:600;color:#0D1B2A;
                             white-space:nowrap;font-family:'Inter',sans-serif;">
                    ${firstName}
                </span>
            </button>

            <!-- Dropdown menu: user info header + nav links -->
            <ul class="dropdown-menu dropdown-menu-end shadow"
                style="min-width:220px;border:none;border-radius:14px;
                       padding:0;overflow:hidden;
                       background:#1A2F42;
                       box-shadow:0 8px 32px rgba(0,0,0,0.4);">

                <!-- User info header -->
                <li>
                    <div style="display:flex;align-items:center;gap:12px;
                                padding:14px 16px;
                                background:#122234;
                                border-bottom:0.5px solid rgba(0,180,216,0.15);">
                        <div style="width:42px;height:42px;border-radius:50%;
                                    background:#1A2F42;border:1.5px solid rgba(0,180,216,0.3);
                                    display:flex;align-items:center;
                                    justify-content:center;font-size:15px;font-weight:700;
                                    color:#00B4D8;flex-shrink:0;
                                    font-family:'Space Grotesk',sans-serif;">
                            ${initials}
                        </div>
                        <div style="min-width:0;">
                            <div style="font-size:14px;font-weight:700;
                                        color:#E8F5E9;font-family:'Inter',sans-serif;
                                        white-space:nowrap;overflow:hidden;
                                        text-overflow:ellipsis;max-width:140px;">
                                ${userName}
                            </div>
                            <div style="font-size:11px;color:#8FAABF;
                                        font-family:'Inter',sans-serif;
                                        white-space:nowrap;overflow:hidden;
                                        text-overflow:ellipsis;max-width:140px;
                                        margin-top:2px;">
                                ${user.email}
                            </div>
                        </div>
                    </div>
                </li>

                <!-- Menu items -->
                <li><a class="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                       href="profile.html"
                       style="color:#E8F5E9;font-size:13px;font-family:'Inter',sans-serif;">
                    <i class="fa fa-user-circle" style="color:#00B4D8;width:16px;text-align:center;"></i>
                    My Profile
                </a></li>
                <li><a class="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                       href="orders.html"
                       style="color:#E8F5E9;font-size:13px;font-family:'Inter',sans-serif;">
                    <i class="fa fa-box" style="color:#00B4D8;width:16px;text-align:center;"></i>
                    My Orders
                </a></li>
                <li><a class="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                       href="cart.html"
                       style="color:#E8F5E9;font-size:13px;font-family:'Inter',sans-serif;">
                    <i class="fa fa-shopping-cart" style="color:#00B4D8;width:16px;text-align:center;"></i>
                    My Cart
                </a></li>
                <li><hr style="margin:4px 0;border-color:rgba(0,180,216,0.15);"></li>
                <li><a class="dropdown-item logout-item py-2 px-3 d-flex align-items-center gap-2"
                       href="#" onclick="doLogout()"
                       style="color:#FF6B6B;font-size:13px;font-family:'Inter',sans-serif;">
                    <i class="fa fa-sign-out-alt" style="color:#FF6B6B;width:16px;text-align:center;"></i>
                    Logout
                </a></li>
            </ul>
        </div>` : `
        <a href="login.html" class="btn btn-primary custom-btn px-4 py-2">
            <i class="fa fa-user me-2"></i>Login
        </a>`;

    return `
    <style>
        .dropdown-item:hover,.dropdown-item:focus{background:rgba(0,180,216,0.08)!important;color:#E8F5E9!important;}
        .logout-item:hover,.logout-item:focus{background:rgba(255,107,107,0.08)!important;color:#FF6B6B!important;}
        .navbar-nav .nav-link.active{color:#00B4D8!important;font-weight:600!important;}
        @media(max-width:991px){
            .navbar-nav .nav-link{padding:10px 16px!important;border-bottom:0.5px solid rgba(0,180,216,0.08);}
            #navbarCollapse{background:#122234;padding:8px 0;border-top:0.5px solid rgba(0,180,216,0.14);}
        }
    </style>
    <nav class="navbar navbar-expand-lg sticky-top p-0"
         style="background:#122234;border-bottom:0.5px solid rgba(0,180,216,0.14);">

        <!-- Brand -->
        <a href="index.html" class="navbar-brand d-flex align-items-center px-4 px-lg-4">
            <div style="width:36px;height:36px;background:rgba(0,180,216,0.12);border-radius:8px;
                        display:flex;align-items:center;justify-content:center;
                        color:#00B4D8;font-size:16px;margin-right:10px;flex-shrink:0;">
                <i class="fa fa-seedling"></i>
            </div>
            <div>
                <div style="font-size:17px;font-weight:700;color:#00B4D8;
                            font-family:'Inter',sans-serif;line-height:1.1;">
                    Fresh &amp; Organic
                </div>
                <div style="font-size:9px;color:#8FAABF;letter-spacing:0.14em;
                            text-transform:uppercase;font-family:'Inter',sans-serif;">
                    COLD STORAGE
                </div>
            </div>
        </a>

        <!-- Hamburger -->
        <button type="button" class="navbar-toggler me-4" style="border-color:rgba(0,180,216,0.3);"
                data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span class="navbar-toggler-icon" style="filter:invert(1);"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarCollapse">
            <!-- Nav links — centered, no extra gap -->
            <div class="navbar-nav mx-auto p-4 p-lg-0" style="gap:0;">
                ${navLinks}
            </div>

            <!-- Right side actions -->
            <div class="d-flex align-items-center pe-4 gap-2">

                <!-- Search toggle -->
                <div class="position-relative" id="searchWrapper">
                    <button onclick="toggleSearch();" type="button" aria-label="Search"
                            style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);
                                   border:0.5px solid rgba(0,180,216,0.2);color:#8FAABF;
                                   display:flex;align-items:center;justify-content:center;cursor:pointer;">
                        <i class="fa fa-search" style="font-size:14px;"></i>
                    </button>
                    <div id="searchBox" class="search-box" style="display:none;position:absolute;
                         top:calc(100% + 10px);right:0;width:280px;
                         background:#122234;border:0.5px solid rgba(0,180,216,0.2);
                         border-radius:12px;padding:10px;z-index:1000;
                         box-shadow:0 4px 24px rgba(0,0,0,0.3);">
                        <input type="text" id="searchInput"
                               style="width:100%;background:#1A2F42;border:0.5px solid rgba(0,180,216,0.2);
                                      border-radius:8px;padding:8px 12px;font-size:13px;
                                      color:#E8F5E9;outline:none;font-family:'Inter',sans-serif;"
                               placeholder="Search products..."
                               oninput="window._navHandleSearch(this.value)"
                               onkeydown="if(event.key==='Escape'){toggleSearch();}
                                          if(event.key==='Enter'&&this.value.trim()){
                                              window.location.href='products.html?q='+encodeURIComponent(this.value.trim());
                                          }">
                    </div>
                </div>

                <!-- Cart -->
                <button onclick="if(window.requireLogin('view your cart')) window.location.href='cart.html';"
                        style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);
                               border:0.5px solid rgba(0,180,216,0.2);color:#8FAABF;
                               display:flex;align-items:center;justify-content:center;
                               cursor:pointer;position:relative;"
                        aria-label="View cart">
                    <i class="fa fa-shopping-cart" style="font-size:15px;"></i>
                    <span class="cart-count-badge"
                          style="position:absolute;top:-5px;right:-5px;background:#e53935;color:#fff;
                                 width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:700;
                                 display:flex;align-items:center;justify-content:center;line-height:1;">0</span>
                </button>

                ${userSection}
            </div>
        </div>
    </nav>`;
}

/* ── inject navbar & watch auth ── */
const currentPage = window.location.pathname.split("/").pop() || "index.html";

/* ── Instant navbar using cached auth state ── */
document.addEventListener("DOMContentLoaded", () => {
    const ph = document.getElementById("navbar-placeholder");
    if (!ph || ph.innerHTML.trim()) return;

    /* read cached user from localStorage */
    const cached = localStorage.getItem("__navUser");
    if (cached) {
        try {
            const u = JSON.parse(cached);
            ph.innerHTML = buildNavbar(u);
            syncCartCount(true);
        } catch(e) {
            ph.innerHTML = buildNavbar(null);
            syncCartCount(false);
        }
    } else {
        ph.innerHTML = buildNavbar(null);
        syncCartCount(false);
    }
});

onAuthStateChanged(auth, user => {
    window.__firebaseUser = user || null;

    if (!user && FULLY_PROTECTED_PAGES.includes(currentPage)) {
        sessionStorage.setItem("loginRedirectFrom", window.location.href);
        window.location.href = "login.html";
        return;
    }

    /* cache user for instant navbar on next load */
    if (user) {
        localStorage.setItem("__navUser", JSON.stringify({
            displayName: user.displayName || '',
            email:       user.email || ''
        }));
    } else {
        localStorage.removeItem("__navUser");
    }

    const placeholder = document.getElementById("navbar-placeholder");
    if (placeholder) {
        placeholder.innerHTML = buildNavbar(user);
        syncCartCount(!!user);

        /* Nav link active + hover colors */
        placeholder.querySelectorAll(".nav-link").forEach(a => {
            a.style.color = a.classList.contains("active") ? "#00B4D8" : "#8FAABF";
            a.addEventListener("mouseenter", () => { if (!a.classList.contains("active")) a.style.color = "#00B4D8"; });
            a.addEventListener("mouseleave", () => { if (!a.classList.contains("active")) a.style.color = "#8FAABF"; });
        });

        /* Pick up ?q= from URL if on products.html */
        if (currentPage === "products.html") {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                const input = document.getElementById("searchInput");
                if (input) input.value = q;
                const box = document.getElementById("searchBox");
                if (box) box.style.display = "block";
                setTimeout(() => {
                    if (typeof window.handleSearch === "function") window.handleSearch(q);
                }, 50);
            }
        }
    }
});

/* ── close search box on outside click ── */
document.addEventListener("click", e => {
    const box     = document.getElementById("searchBox");
    const wrapper = document.getElementById("searchWrapper");
    if (box && box.style.display === "block" && !wrapper?.contains(e.target)) {
        box.style.display = "none";
    }
});

export { auth, app };
