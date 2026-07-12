from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
from bson import ObjectId
from database import vehicle_collection, driver_collection, trip_collection, maintenance_collection
app = FastAPI(title="Odoo Fleet Management API")
PyObjectId = Annotated[str, BeforeValidator(str)]
class VehicleModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    plate_number: str
    capacity_kg: float
    status: str = "Active"
    class Config:
        populate_by_name = True
class DriverModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    full_name: str
    license_number: str
    phone: str
    class Config:
        populate_by_name = True
class TripModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    vehicle_id: str  
    driver_id: str   
    cargo_weight_kg: float
    status: str = "Draft" 
    class Config:
        populate_by_name = True
@app.get("/")
async def root():
    return {"message": "Hackathon API is live!"}
@app.get("/test-connection")
async def test_db():
    count = await vehicle_collection.count_documents({})
    return {"message": "MongoDB linked successfully!", "total_vehicles": count}
@app.post("/vehicles/", response_model=VehicleModel)
async def create_vehicle(vehicle: VehicleModel = Body(...)):
    vehicle_dict = vehicle.model_dump(by_alias=True, exclude=["id"])
    existing = await vehicle_collection.find_one({"plate_number": vehicle_dict["plate_number"]})
    if existing:
        raise HTTPException(status_code=400, detail="Plate number already exists")
    insert_result = await vehicle_collection.insert_one(vehicle_dict)
    return await vehicle_collection.find_one({"_id": insert_result.inserted_id})
@app.get("/vehicles/", response_model=List[VehicleModel])
async def get_all_vehicles():
    return await vehicle_collection.find().to_list(length=100)
@app.post("/drivers/", response_model=DriverModel)
async def create_driver(driver: DriverModel = Body(...)):
    driver_dict = driver.model_dump(by_alias=True, exclude=["id"])
    existing = await driver_collection.find_one({"license_number": driver_dict["license_number"]})
    if existing:
        raise HTTPException(status_code=400, detail="License number already registered")    
    result = await driver_collection.insert_one(driver_dict)
    return await driver_collection.find_one({"_id": result.inserted_id})
@app.get("/drivers/", response_model=List[DriverModel])
async def get_all_drivers():
    return await driver_collection.find().to_list(length=100)
@app.post("/trips/", response_model=TripModel)
async def create_trip(trip: TripModel = Body(...)):
    trip_dict = trip.model_dump(by_alias=True, exclude=["id"])    
    vehicle = await vehicle_collection.find_one({"_id": ObjectId(trip_dict["vehicle_id"])})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.get("status") != "Active":
        raise HTTPException(status_code=400, detail=f"Vehicle is {vehicle.get('status')} and cannot be booked.")
    driver = await driver_collection.find_one({"_id": ObjectId(trip_dict["driver_id"])})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    trip_dict["status"] = "Dispatched"
    result = await trip_collection.insert_one(trip_dict)
    await vehicle_collection.update_one(
        {"_id": ObjectId(trip_dict["vehicle_id"])},
        {"$set": {"status": "Dispatched"}}
    )
    return await trip_collection.find_one({"_id": result.inserted_id})
@app.get("/trips/", response_model=List[TripModel])
async def get_all_trips():
    return await trip_collection.find().to_list(length=100)
@app.put("/trips/{trip_id}/complete")
async def complete_trip(trip_id: str):
    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid Trip ID")
    trip = await trip_collection.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")    
    if trip.get("status") == "Completed":
        raise HTTPException(status_code=400, detail="Trip already completed")
    await trip_collection.update_one({"_id": ObjectId(trip_id)}, {"$set": {"status": "Completed"}})
    await vehicle_collection.update_one({"_id": ObjectId(trip["vehicle_id"])}, {"$set": {"status": "Active"}})
    return {"message": "Trip completed! Vehicle is now Active.", "trip_id": trip_id}