#  Shopnexa - Secured Digital Investment Platform

**Shopnexa** is a modern, full-stack multi-vendor digital investment platform. It is designed to bridge the gap between investors looking for opportunities and vendors seeking capital for their business ventures. Built with a focus on security, scalability, and a premium user experience.

---

##  Key Features

* **Dual-Role Dashboard:** Custom-tailored dynamic dashboards for both Investors and Vendors.
* **Professional Hero Section:** A perfectly centered, 3-card responsive carousel for high-impact visual delivery.
* **Smart Vendor Analytics:** Real-time capital tracking and automated asset calculation based on investment maturity.
* **Admin Suite:** Full administrative control for user management, platform monitoring, and activity logging.
* **Polished UI/UX:** Unified card heights, optimized section spacing, and a clean grid system for a production-ready look.
* **Automated Email System:** Integrated with Nodemailer for instant communication via contact forms.
* **Fully Responsive:** Pixel-perfect layout across mobile, tablet, and desktop devices.

---

## Tech Stack

* **Frontend:** React.js, Tailwind CSS (for sleek, high-performance styling)
* **Backend:** Node.js, Express (Runtime: tsx)
* **Database:** PostgreSQL (Cloud Hosting: **Neon.tech**)
* **ORM:** Prisma (Type-safe database queries and migrations)
* **Email Service:** Gmail SMTP with secure App Passwords
* **Authentication:** Secure JWT / Cookie-based Authentication

---

## Installation & Local Setup

Follow these steps to get the project running on your local machine:

### 1. Clone the Repository
```bash
git clone [YOUR_GITHUB_REPOSITORY_LINK]
cd shopnexa

2. Install Dependencies
Bash
npm install
3. Setup Environment Variables
Create a .env file in the root directory and add the following credentials:

Code snippet
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]/neondb?sslmode=require"
EMAIL_USER="mr.fahim.diu.cse@gmail.com"
EMAIL_PASS="krjb ffxd bfvz iezi"
4. Database Sync & Run
Bash
# Sync database tables
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run the development server
npm run dev

Design Principles Applied:

Symmetry: Centered hero carousel container with a max-w-[1200px] constraint for professional desktop viewing.

Consistency: Fixed image aspect ratios and standardized card heights (min-h-[520px]) across the landing page.

Spacing: Optimized vertical padding (py-12 to py-16) and tight grid gaps (gap-6) for a compact, modern feel.

Branding: Custom-styled footer featuring "Designed By Mr. Fahim".

👨‍💻 Developed By:
Mr. Fahim
Full-Stack Developer | UX Specialist

📄 License
This project is for demonstration and portfolio purposes. All rights reserved by the developer.


### **What’s next?**
1.  **Save** the file.
2.  **Push** to GitHub:
    ```bash
    git add README.md
    git commit -m "Added professional English README"
    git push origin main
    ```

