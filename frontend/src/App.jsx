import { useState, useEffect } from 'react'

function App() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This talks to your newly updated FastAPI backend!
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
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f2f2f2' }}>
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
                  color: vehicle.status === 'Active' ? 'green' : vehicle.status === 'Dispatched' ? 'orange' : 'red',
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