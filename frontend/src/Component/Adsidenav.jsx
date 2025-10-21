import React from 'react'
import { Link } from 'react-router-dom'

function Adsidenav() {
  return (
        <div className="col-2 h-100 pe-5" style={{overflow:"auto"}}>
            <div className=" row h-100 bg-light rounded-4 pt-5" >
                <ul type="none">
                    <li>
                        <Link to={'/admindash'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Dashboard</Link>
                        <Link to={'/addoc'}className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Add Doctor</Link>
                        <Link to={'/viewdoc'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Viewdoc</Link>
                         
                          <Link to={'/adpatient'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Add Patient</Link>
                          <Link to={'/viewpatient'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Viewpatient</Link>
                           <Link to={'/viewapp'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Viewapp</Link>

                             <Link to={'/viewenquiry'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Viewenquiry</Link>
                              <Link to={'/viewfeed'} className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Viewfeed</Link>
                              <Link to={'/adnews'}className='nav-link bg-white py-2 ps-3 rounded-start my-2'>Add News</Link>

                    </li>
                </ul>
            </div>
        </div>
  )
}

export default Adsidenav