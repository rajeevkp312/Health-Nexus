import React from 'react'
import { Link } from 'react-router-dom'

function Dsidenav() {
  return (
        <div className="col-2 h-100 pe-5" style={{overflow:"auto"}}>
            <div className=" row h-100 bg-light rounded-4 pt-5" >
                <ul type="none">
                    <li>
                        <Link to={'/ddash'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Dashboard</Link>
                        <Link to={'/penapp'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Pending Appointment</Link>
                        <Link to={'/conapp'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Confirm Appointment</Link>
                        <Link to={'/canapp'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Cancelled Appointment</Link>
                        <Link to={'/comapp'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Completed Appointment</Link>
                    </li>
                </ul>
            </div>
        </div>
  )
}

export default Dsidenav