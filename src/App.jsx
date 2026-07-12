import { useState, useEffect } from 'react'
import Vehicles from './pages/Vehicles';
function App() {
    //const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    // This function fetches data from your Python API
    useEffect(() => {
        fetch('http://127.0.0.1:8000/vehicles/')
            .then(response => response.json())
            .then(data => {
                setVehicles(data)
                setLoading(false)
            })
            .catch(error => console.error("Error fetching data:", error))
    }, [])

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>🚚 Odoo Fleet Management</h1>

            {loading ? (
                <p>Loading vehicles from database...</p>
            ) : (
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Plate Number</th>
                            <th>Capacity (kg)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle._id}>
                                <td>{vehicle.plate_number}</td>
                                <td>{vehicle.capacity_kg}</td>
                                <td style={{
                                    color: vehicle.status === 'Active' ? 'green' : 'red',
                                    fontWeight: 'bold'
                                }}>
                                    {vehicle.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default App