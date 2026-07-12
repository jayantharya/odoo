from motor.motor_asyncio import AsyncIOMotorClient

# Ensure this matches your actual MongoDB connection string
MONGO_DETAILS = "mongodb+srv://jkdarya:JkD1816@jkdarya.rbpb7ns.mongodb.net/"
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.fleet_management 

# Collections
vehicle_collection = database.get_collection("vehicles")
driver_collection = database.get_collection("drivers")
trip_collection = database.get_collection("trips")
maintenance_collection = database.get_collection("maintenance")
fuel_collection = database.get_collection("fuel") # NEW: Dedicated fuel collection