import pytest

from app.business_logic import ShipmentService


@pytest.fixture
def service():
    return ShipmentService()


def test_rejects_weight_over_capacity(service):
    with pytest.raises(ValueError, match="exceeds capacity"):
        service.create_shipment(weight_kg=1200, capacity_kg=1000)


def test_marks_in_shop_when_weight_is_safe(service):
    shipment = service.create_shipment(weight_kg=800, capacity_kg=1000)
    assert shipment["status"] == "In Shop"


def test_requires_authentication_for_external_routing(service):
    with pytest.raises(PermissionError, match="authenticated"):
        service.route_shipment(destination="A1", api_key=None)


def test_dispatch_requires_available_vehicle_and_driver(service):
    with pytest.raises(ValueError, match="Vehicle"):
        service.dispatch_trip(
            cargo_weight=500,
            vehicle={"status": "In Shop", "max_load_capacity": 1000},
            driver={"status": "Available", "license_expiry_date": "2030-01-01"},
        )

    with pytest.raises(ValueError, match="Driver"):
        service.dispatch_trip(
            cargo_weight=500,
            vehicle={"status": "Available", "max_load_capacity": 1000},
            driver={"status": "On Trip", "license_expiry_date": "2030-01-01"},
        )

    with pytest.raises(ValueError, match="license"):
        service.dispatch_trip(
            cargo_weight=500,
            vehicle={"status": "Available", "max_load_capacity": 1000},
            driver={"status": "Available", "license_expiry_date": "2020-01-01"},
        )


def test_dispatch_updates_states_and_trip_status(service):
    result = service.dispatch_trip(
        cargo_weight=500,
        vehicle={"status": "Available", "max_load_capacity": 1000},
        driver={"status": "Available", "license_expiry_date": "2030-01-01"},
    )

    assert result["trip_status"] == "Dispatched"
    assert result["vehicle_status"] == "On Trip"
    assert result["driver_status"] == "On Trip"


def test_complete_trip_returns_assets_to_available(service):
    result = service.complete_trip(
        vehicle={"status": "On Trip"},
        driver={"status": "On Trip"},
    )

    assert result["trip_status"] == "Completed"
    assert result["vehicle_status"] == "Available"
    assert result["driver_status"] == "Available"


def test_cancel_trip_reverts_asset_states(service):
    result = service.cancel_trip(
        vehicle={"status": "On Trip"},
        driver={"status": "On Trip"},
    )

    assert result["trip_status"] == "Cancelled"
    assert result["vehicle_status"] == "Available"
    assert result["driver_status"] == "Available"


def test_maintenance_transitions(service):
    in_shop = service.open_maintenance(vehicle={"status": "Available"})
    assert in_shop["vehicle_status"] == "In Shop"

    available = service.close_maintenance(vehicle={"status": "In Shop", "retired": False})
    assert available["vehicle_status"] == "Available"

    with pytest.raises(ValueError, match="Retired"):
        service.close_maintenance(vehicle={"status": "In Shop", "retired": True})
