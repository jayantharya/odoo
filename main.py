from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
from bson import ObjectId

from database import vehicle_collection, driver_collection, trip_collection

app = FastAPI(title="Odoo Fleet Management API")

PyObjectId = Annotated[str, BeforeValidator(str)]

class VehicleModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    plate_number: str
    capacity_kg: float
    status: str = "Active"

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
    created_vehicle = await vehicle_collection.find_one({"_id": insert_result.inserted_id})
    return created_vehicle

@app.get("/vehicles/", response_model=List[VehicleModel])
async def get_all_vehicles():
    return await vehicle_collection.find().to_list(length=100)