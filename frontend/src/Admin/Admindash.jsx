import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Adsidenav from '../Component/Adsidenav'
import { useEffect } from 'react';
import axios from 'axios';

function Admindash() {
    const navigate=useNavigate();
    const [stats,setStats]=useState([]);

    async function getall() {
        const response=await axios.get('http://local:8000/api/admin/stats');
        if(response.data.msg=="Success")
        {
            setStats(response.data.value);
        }
    }
    function validation (){
        const data = localStorage.getItem('admin');
        if(data!="admin@gmail.com"){
            navigate('/admin')
        }
    }
    useEffect(()=>{
        validation();
        getall();
    },[])

  return (
    <div>
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
            <h4 className='my-5 text-center'>Dashboard</h4>

             <div className="row">
                <div className="col-md-11 mx-auto py-5">
                    <div class="row row-cols-1 row-cols-md-4 g-4">
  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.d}</h5>
        <p class="card-text">Doctors</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.p}</h5>
        <p class="card-text">Patients</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{stats.c}</h5>
        <p class="card-text">Complains</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100 text-primary border-primary-shadow" >
      <div class="card-body">
        <h5 class="card-title">{stats.n}</h5>
        <p class="card-text">News</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100 text-primary border-primary-shadow" >
      <div class="card-body">
        <h5 class="card-title">{stats.f}</h5>
        <p class="card-text">Feedback</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100 text-primary border-primary-shadow" >
      <div class="card-body">
        <h5 class="card-title">{stats.pena}</h5>
        <p class="card-text">Patient appointment</p>
      </div>
    </div>
  </div>
</div>
                </div>
            </div>
        
        </div>
    </div>
    </div>
  )
}

export default Admindash