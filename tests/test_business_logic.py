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
