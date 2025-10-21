import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Adsidenav from '../Component/Adsidenav'
import { useEffect } from 'react';

function Viewapp() {
    const navigate=useNavigate();
    function validation (){
        const data = localStorage.getItem('admin');
        if(data!="admin@gmail.com"){
            navigate('/admin')
        }
    }
    useEffect(()=>{
        validation();
    },[])

  return (
    <>
    <div className="row" style={{height:"8vh" ,background:"lightgrey"}}>
        <div className="col-4">
            <h4>Admin Dashboard</h4>
        </div>
        <div className="col-2 pe-3 my-auto ms-auto text-end">
            <button onClick={()=>{
                localStorage.removeItem("admin");
                validation();
            }} className="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    </div>

    <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
        <Adsidenav></Adsidenav>
        <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
            <h4 className='my-5 text-center'>view appointment</h4>
        </div>
    </div>
    </>
  )
}

export default Viewapp