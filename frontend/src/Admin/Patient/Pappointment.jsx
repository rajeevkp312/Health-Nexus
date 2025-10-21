import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Psidenav from '../../Component/Psidenav';
import axios from 'axios';

function Pappointment() {
    const navigate=useNavigate();
    const[appointment,setAppointment]=useState([]);


    async function getapp() {
        const response=await axios.get(`http://localhost:8000/api/app/p/${localStorage.getItem('patient')}`);
        if(response.data.msg=="Success"){
            setAppointment(response.data.value)
        }
    }


    function validation (){
        const data = localStorage.getItem('patient');
        if(data==null){
            navigate('/login')
        }
    }
    useEffect(()=>{
        validation();
        getapp();
    },[])

  return (
    <>
    <div className="row" style={{height:"8vh" ,background:"lightgrey"}}>
        <div className="col-4">
            <h4>Patient Dashboard</h4>
        </div>
        <div className="col-2 pe-3 my-auto ms-auto text-end">
            <button onClick={()=>{
                localStorage.removeItem("patient");
                validation();
            }} className="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    </div>

    <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
        <Psidenav></Psidenav>
        <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
            <h4 className='my-5 text-center'>Patient appointment</h4>


            <div className="row ">
            <div className="col-md-8 p-5 rounded shadow-lg mx-auto table-responsive">
                <table className='table table-dark'>
                    <thead>
                        <tr>
                            <th>S.no</th>
                            <th>Doctor Name</th>
                            <th>Slot</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>status</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    {/* <tbody>
                        {
                            appointment.map((app,i)=>{
                                <tr>
                                    <td>{i+1}</td>
                                    <td>{app.did.name}</td>
                                    <td>{app.slot}</td>
                                    <td>{app.date}</td>
                                    <td>{app.description}</td>
                                    <td>{app.status}</td>
                                    <td>Edit</td>
                                    <td>Delete</td>
                                </tr>
                            })
                        }
                    </tbody> */}

                    <tbody>
  {appointment.map((app, i) => (
    <tr key={app._id}>  {/* Add key for React's reconciliation */}
      <td>{i + 1}</td>
      <td>{app.did?.name || 'N/A'}</td>  {/* Use optional chaining to avoid errors */}
      <td>{app.slot}</td>
      <td>{app.date}</td>
      <td>{app.description}</td>
      <td>{app.status}</td>
      <td>
        <button onClick={() => {/* Add edit logic, e.g., navigate to edit page */}}>Edit</button>
      </td>
      <td>
        <button onClick={() => {/* Add delete logic, e.g., axios.delete */}}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>

                </table>
            </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Pappointment