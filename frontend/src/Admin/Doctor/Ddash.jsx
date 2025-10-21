import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Dsidenav from '../../Component/Dsidenav';

function Ddash() {
    const navigate=useNavigate();
    const [stats,setStats]=useState([])

    async function getall() {
        const response=await axios.get(`http://local:8000/api/doctor/stats/${localStorage.getItem('doctor')}`);
        if(response.data.msg=="Success")
        {
            setStats(response.data.value);
        }
    }
    function validation (){
        const data = localStorage.getItem('doctor');
        if(data==null){
            navigate('/login')
        }
    }
    useEffect(()=>{
        validation();
        getall();
    },[])

  return (
    <>
    <div className="row" style={{height:"8vh" ,background:"lightgrey"}}>
        <div className="col-4">
            <h4>Doctor Dashboard</h4>
        </div>
        <div className="col-2 pe-3 my-auto ms-auto text-end">
            <button onClick={()=>{
                localStorage.removeItem("doctor");
                validation();
            }} className="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    </div>

    <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
        <Dsidenav/>
        <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
            <h4 className='my-5 text-center'>Dashboard</h4>

             <div className="row">
                <div className="col-md-11 mx-auto py-5">
                    <div class="row row-cols-1 row-cols-md-4 g-4">
  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.f}</h5>
        <p class="card-text">Feedback</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.s}</h5>
        <p class="card-text">Suggestion</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.c}</h5>
        <p class="card-text">Complaints</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.a}</h5>
        <p class="card-text">Total Appointments</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.pena}</h5>
        <p class="card-text">Patient Appointment</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.cona}</h5>
        <p class="card-text">Confirmed Appointments</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.coma}</h5>
        <p class="card-text">Completed Appointments</p>
      </div>
    </div>
  </div>

  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.cana}</h5>
        <p class="card-text">Cancelled Appointments</p>
      </div>
    </div>
  </div>
  
</div>
                </div>
            </div>

        </div>
    </div>
    </>
  )
}

export default Ddash