from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, BeforeValidator, AliasChoices
from typing import Annotated, Optional, List
from bson import ObjectId
import logging
import traceback

from database import vehicle_collection, driver_collection, trip_collection, maintenance_collection, fuel_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("transitops")

app = FastAPI(title="TransitOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s\n%s", request.method, request.url, traceback.format_exc())
    response = JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {str(exc)}"},
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

PyObjectId = Annotated[str, BeforeValidator(str)]

# --- 1. SCHEMAS ---

class VehicleModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    registration_number: str = Field(validation_alias=AliasChoices("registration_number", "plate_number"))
    vehicle_type: str = "Van"
    max_load_capacity: float = Field(default=0, validation_alias=AliasChoices("max_load_capacity", "capacity_kg"))
    odometer: int = 0
    status: str = "Available" 
    
    class Config:
        populate_by_name = True

class DriverModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    full_name: str
    license_number: str
    status: str = "Available" 
    
    class Config:
        populate_by_name = True

class TripModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    vehicle_id: str  
    driver_id: str   
    cargo_weight_kg: float = 0
    status: str = "Draft" 
    
    class Config:
        populate_by_name = True

class MaintenanceModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    vehicle_id: str
    description: str
    cost: float = 0
    status: str = "Active" 
    
    class Config:
        populate_by_name = True

class FuelExpenseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    vehicle_id: str
    liters: float = 0
    total_cost: float = 0
    date: str = ""
    
    class Config:
        populate_by_name = True

# --- 2. GET ROUTES (Data Fetching) ---

@app.get("/")
async def root():
    return {"message": "TransitOps API is live!"}

@app.get("/vehicles/", response_model=List[VehicleModel])
async def get_all_vehicles():
    return await vehicle_collection.find().to_list(length=100)

@app.get("/drivers/", response_model=List[DriverModel])
async def get_all_drivers():
    return await driver_collection.find().to_list(length=100)

@app.get("/trips/", response_model=List[TripModel])
async def get_all_trips():
    return await trip_collection.find().to_list(length=100)

@app.get("/maintenance/", response_model=List[MaintenanceModel])
async def get_all_maintenance():
    return await maintenance_collection.find().to_list(length=100)

@app.get("/fuel/", response_model=List[FuelExpenseModel])
async def get_all_fuel():
    # Now using the dedicated fuel collection!
    return await fuel_collection.find().to_list(length=100)

# --- 3. DASHBOARD AGGREGATION ---

@app.get("/api/dashboard-stats")
async def get_dashboard_stats():
    active_vehicles = await vehicle_collection.count_documents({"status": {"$in": ["Available", "On Trip"]}})
    available_vehicles = await vehicle_collection.count_documents({"status": "Available"})
    in_maintenance = await vehicle_collection.count_documents({"status": "In Shop"})
    active_trips = await trip_collection.count_documents({"status": "Dispatched"})
    pending_trips = await trip_collection.count_documents({"status": "Draft"})
    drivers_on_duty = await driver_collection.count_documents({"status": "On Trip"})
    total_vehicles = await vehicle_collection.count_documents({"status": {"$ne": "Retired"}})
    utilization = round((active_trips / total_vehicles * 100)) if total_vehicles > 0 else 0
    
    return {
        "activeVehicles": active_vehicles,
        "availableVehicles": available_vehicles,
        "inMaintenance": in_maintenance,
        "activeTrips": active_trips,
        "pendingTrips": pending_trips,
        "driversOnDuty": drivers_on_duty,
        "utilization": utilization
    }

# --- 4. POST & PUT ROUTES (Business Logic & State Transitions) ---

@app.post("/vehicles/", response_model=VehicleModel)
async def create_vehicle(vehicle: VehicleModel = Body(...)):
    vehicle_dict = vehicle.model_dump(by_alias=True, exclude={"id"})
    existing = await vehicle_collection.find_one({"registration_number": vehicle_dict["registration_number"]})
    if existing:
        raise HTTPException(status_code=400, detail="Registration number already exists")
    insert_result = await vehicle_collection.insert_one(vehicle_dict)
    return await vehicle_collection.find_one({"_id": insert_result.inserted_id})

@app.post("/drivers/", response_model=DriverModel)
async def create_driver(driver: DriverModel = Body(...)):
    driver_dict = driver.model_dump(by_alias=True, exclude={"id"})
    existing = await driver_collection.find_one({"license_number": driver_dict["license_number"]})
    if existing:
        raise HTTPException(status_code=400, detail="License number already registered")    
    result = await driver_collection.insert_one(driver_dict)
    return await driver_collection.find_one({"_id": result.inserted_id})

@app.post("/trips/", response_model=TripModel)
async def create_trip(trip: TripModel = Body(...)):
    trip_dict = trip.model_dump(by_alias=True, exclude={"id"})

    if not ObjectId.is_valid(trip_dict["vehicle_id"]) or not ObjectId.is_valid(trip_dict["driver_id"]):
        raise HTTPException(status_code=400, detail="Invalid vehicle_id or driver_id")

    vehicle = await vehicle_collection.find_one({"_id": ObjectId(trip_dict["vehicle_id"])})
    if not vehicle or vehicle.get("status") != "Available":
        raise HTTPException(status_code=400, detail="Vehicle is not Available.")
        
    if trip_dict["cargo_weight_kg"] > vehicle.get("max_load_capacity", 0):
        raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle capacity.")
    
    driver = await driver_collection.find_one({"_id": ObjectId(trip_dict["driver_id"])})
    if not driver or driver.get("status") != "Available":
        raise HTTPException(status_code=400, detail="Driver is not Available.")
    
    trip_dict["status"] = "Dispatched"
    result = await trip_collection.insert_one(trip_dict)
    
    await vehicle_collection.update_one({"_id": ObjectId(trip_dict["vehicle_id"])}, {"$set": {"status": "On Trip"}})
    await driver_collection.update_one({"_id": ObjectId(trip_dict["driver_id"])}, {"$set": {"status": "On Trip"}})
    
    return await trip_collection.find_one({"_id": result.inserted_id})

@app.put("/trips/{trip_id}/complete")
async def complete_trip(trip_id: str):
    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid Trip ID")
    trip = await trip_collection.find_one({"_id": ObjectId(trip_id)})
    if not trip or trip.get("status") == "Completed":
        raise HTTPException(status_code=404, detail="Trip not found or already completed")    
    
    await trip_collection.update_one({"_id": ObjectId(trip_id)}, {"$set": {"status": "Completed"}})
    await vehicle_collection.update_one({"_id": ObjectId(trip["vehicle_id"])}, {"$set": {"status": "Available"}})
    await driver_collection.update_one({"_id": ObjectId(trip["driver_id"])}, {"$set": {"status": "Available"}})
    return {"message": "Trip completed!"}

@app.post("/maintenance/", response_model=MaintenanceModel)
async def create_maintenance(log: MaintenanceModel = Body(...)):
    log_dict = log.model_dump(by_alias=True, exclude={"id"})

    if not ObjectId.is_valid(log_dict["vehicle_id"]):
        raise HTTPException(status_code=400, detail="Invalid vehicle_id")

    vehicle = await vehicle_collection.find_one({"_id": ObjectId(log_dict["vehicle_id"])})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    result = await maintenance_collection.insert_one(log_dict)
    await vehicle_collection.update_one({"_id": ObjectId(log_dict["vehicle_id"])}, {"$set": {"status": "In Shop"}})
    return await maintenance_collection.find_one({"_id": result.inserted_id})

@app.put("/maintenance/{log_id}/complete")
async def complete_maintenance(log_id: str):
    if not ObjectId.is_valid(log_id):
        raise HTTPException(status_code=400, detail="Invalid Log ID")
    log = await maintenance_collection.find_one({"_id": ObjectId(log_id)})
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    await maintenance_collection.update_one({"_id": ObjectId(log_id)}, {"$set": {"status": "Completed"}})
    await vehicle_collection.update_one({"_id": ObjectId(log["vehicle_id"])}, {"$set": {"status": "Available"}})
    return {"message": "Maintenance completed"}

@app.post("/fuel/", response_model=FuelExpenseModel)
async def create_fuel_log(log: FuelExpenseModel = Body(...)):
    log_dict = log.model_dump(by_alias=True, exclude={"id"})
    result = await fuel_collection.insert_one(log_dict)
    return await fuel_collection.find_one({"_id": result.inserted_id})