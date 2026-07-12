<<<<<<< HEAD
from datetime import datetime
=======
from contextlib import contextmanager
from datetime import date
>>>>>>> 257e5063e85fbf761e9ea0055be58ace49bb541d


class ShipmentService:
    def __init__(self):
        self.last_transaction = None

    @contextmanager
    def transaction(self, name):
        self.last_transaction = f"{name}:begin"
        try:
            yield
            self.last_transaction = f"{name}:commit"
        except Exception:
            self.last_transaction = f"{name}:rollback"
            raise

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
<<<<<<< HEAD
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
=======
        with self.transaction("dispatch"):
            self._validate_transaction_state(cargo_weight, vehicle, driver)
            return {
                "trip_status": "Dispatched",
                "vehicle_status": "On Trip",
                "driver_status": "On Trip",
            }
>>>>>>> 257e5063e85fbf761e9ea0055be58ace49bb541d

    def complete_trip(self, vehicle, driver):
        with self.transaction("complete"):
            return {
                "trip_status": "Completed",
                "vehicle_status": "Available",
                "driver_status": "Available",
            }

    def cancel_trip(self, vehicle, driver):
        with self.transaction("cancel"):
            return {
                "trip_status": "Cancelled",
                "vehicle_status": "Available",
                "driver_status": "Available",
            }

    def open_maintenance(self, vehicle):
        with self.transaction("maintenance_open"):
            return {"vehicle_status": "In Shop"}

    def close_maintenance(self, vehicle):
<<<<<<< HEAD
        if vehicle.get("retired"):
            raise ValueError("Vehicle is Retired and cannot return to service")
        return {"vehicle_status": "Available"}
=======
        with self.transaction("maintenance_close"):
            if vehicle.get("retired"):
                raise ValueError("Vehicle is Retired and cannot be made Available")
            return {"vehicle_status": "Available"}

    def _validate_transaction_state(self, cargo_weight, vehicle, driver):
        if cargo_weight > vehicle.get("max_load_capacity", 0):
            raise ValueError("Cargo weight exceeds vehicle capacity")

        if vehicle.get("status") != "Available":
            raise ValueError("Vehicle must be Available")

        if driver.get("status") != "Available":
            raise ValueError("Driver must be Available")

        license_expiry = driver.get("license_expiry_date")
        if isinstance(license_expiry, str):
            try:
                expiry_date = date.fromisoformat(license_expiry)
            except ValueError as exc:
                raise ValueError("Driver license expiry date is invalid") from exc
        else:
            expiry_date = license_expiry

        if expiry_date is None or expiry_date <= date.today():
            raise ValueError("Driver license must be valid")
>>>>>>> 257e5063e85fbf761e9ea0055be58ace49bb541d
