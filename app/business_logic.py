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
            raise PermissionError("authenticated access is required to route shipment")

        return {
            "destination": destination,
            "status": "Routed",
            "api_key": api_key,
        }
