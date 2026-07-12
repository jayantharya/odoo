from datetime import datetime


class ShipmentService:
    def create_shipment(self, weight_kg, capacity_kg):
        if weight_kg > capacity_kg:
            raise ValueError("Cargo weight exceeds capacity")
        return {
            "weight_kg": weight_kg,
            "capacity_kg": capacity_kg,
            "status": "In Shop",
        }

    def route_shipment(self, destination, api_key):
        if not api_key:
            raise PermissionError("Request must be authenticated")
        return {"destination": destination, "routed": True}

    def dispatch_trip(self, cargo_weight, vehicle, driver):
        if vehicle.get("status") != "Available":
            raise ValueError("Vehicle is not Available")

        if cargo_weight > vehicle.get("max_load_capacity", 0):
            raise ValueError("Cargo weight exceeds vehicle capacity")

        if driver.get("status") != "Available":
            raise ValueError("Driver is not Available")

        expiry = datetime.strptime(driver["license_expiry_date"], "%Y-%m-%d")
        if expiry < datetime.now():
            raise ValueError("Driver license has expired")

        return {
            "trip_status": "Dispatched",
            "vehicle_status": "On Trip",
            "driver_status": "On Trip",
        }

    def complete_trip(self, vehicle, driver):
        return {
            "trip_status": "Completed",
            "vehicle_status": "Available",
            "driver_status": "Available",
        }

    def cancel_trip(self, vehicle, driver):
        return {
            "trip_status": "Cancelled",
            "vehicle_status": "Available",
            "driver_status": "Available",
        }

    def open_maintenance(self, vehicle):
        return {"vehicle_status": "In Shop"}

    def close_maintenance(self, vehicle):
        if vehicle.get("retired"):
            raise ValueError("Vehicle is Retired and cannot return to service")
        return {"vehicle_status": "Available"}