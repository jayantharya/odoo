TransitOps: Intelligent Fleet Management System
TransitOps is a comprehensive, full-stack fleet management solution designed to provide real-time monitoring and operational control for logistics. It enables fleet managers to track vehicle status, manage driver rosters, dispatch trips, and oversee maintenance and fuel expenditures in one centralized dashboard.

🚀 Key Modules
Fleet Dashboard: Real-time KPI tracking for fleet utilization, active trips, and vehicle health.

Vehicle Registry: Manage fleet inventory, monitor odometer readings, and set cargo capacity limits.

Driver Management: Onboard drivers, assign them to vehicles, and track duty status.

Trip Operations: End-to-end dispatching with automated cargo weight validation.

Administration: Integrated maintenance logs and financial tracking for fuel expenses.

🛠 Technical Architecture
Backend: FastAPI (Python) with asynchronous database communication via Motor.

Frontend: React (Vite) utilizing Tailwind CSS for a vibrant, responsive interface.

Database: MongoDB (Atlas) for flexible, document-based asset storage.

Communication: RESTful API endpoints with CORS middleware for secure cross-origin requests.

📋 Installation & Setup
Backend (FastAPI)
Navigate to the backend directory.

Install requirements:

Bash
pip install fastapi uvicorn motor pydantic-settings
Run the server:

Bash
uvicorn main:app --reload --port 8000
Frontend (React)
Navigate to the frontend directory.

Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
⚙️ Configuration
Ensure your database.py contains your valid MongoDB connection string:

Python
MONGO_DETAILS = "mongodb+srv://<username>:<password>@cluster.mongodb.net/fleet_management"
📊 Project Highlights
Automated State Transitions: Vehicles are automatically marked as "In Shop" when maintenance logs are created and restored to "Available" upon completion.

Data Validation: Business rules enforce cargo weight limits against vehicle capacity during trip dispatch.

Modern UI: Built with a vibrant indigo-themed aesthetic, focusing on accessibility and fleet-wide visibility.# odoo
