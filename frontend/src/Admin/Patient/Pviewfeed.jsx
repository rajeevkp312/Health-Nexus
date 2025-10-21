import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Psidenav from '../../Component/Psidenav';

function Pviewfeed() {
    const navigate=useNavigate();
    const [feedback,setFeedback]=useState([])
    const getfeed=async()=>{
        const response=await axios.get(`http://localhost:8000/api/feed/u/${localStorage.getItem("patient")}`)
        if(response.data.msg=="Success"){
            setFeedback(response.data.value);
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
        getfeed();
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
            <h4 className='my-5 text-center'>Patient View Feedback</h4>

              <div className="row ">
            <div className="col-md-8 p-5 rounded shadow-lg mx-auto table-responsive">
                <table className='table table-dark'>
                    <thead>
                        <tr>
                            <th>S.no</th>
                            <th>Feed Type</th>
                            <th>Msg</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            feedback.map((f,i)=>
                            
                            <tr>
                            <td>1</td>
                            <td>Suggestion</td>
                            <td>mmmmmmmm</td>
                            <td>Delete</td>
                            </tr>
                            )
                        }
                        
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Pviewfeed