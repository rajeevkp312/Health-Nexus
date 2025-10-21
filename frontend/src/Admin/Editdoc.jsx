import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Editdoc() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [qua, setQua] = useState("");
    const [exp, setExp] = useState("");
    const [spe, setSpe] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    async function getDoctor() {
        const id = localStorage.getItem('edit');
        const response = await axios.get(`http://localhost:8000/api/doctor/${id}`);
        const doc = response.data.value;
        setName(doc.name);
        setEmail(doc.email || "");
        setMobile(doc.number || "");
        setPassword(doc.password || "");
        setGender(doc.gender || "");
        setQua(doc.qua || "");
        setExp(doc.exp || "");
        setSpe(doc.spe || "");
        setAddress(doc.address || "");
    }

    async function updateDoctor(e) {
        e.preventDefault();
        const doc = { name, email, number: mobile, password, gender, qua, exp, spe, address };
        const id = localStorage.getItem('edit');
        const response = await axios.put(`http://localhost:8000/api/doctor/${id}`, doc);
        if (response.data.msg === "Success") {
            window.alert("Data updated successfully");
            navigate('/viewdoc');
        } else {
            window.alert("Something went wrong");
            navigate('/viewdoc');
        }
    }

    useEffect(() => {
        getDoctor();
    }, []);

    return (
        <div className="row">
            <div className="col-md-8 mx-auto p-5">
                <form onSubmit={updateDoctor} className="w-75 mx-auto p-5 rounded-4 shadow-lg">
                    <h4>Edit Doctor</h4>
                    <br />

                    <label>Name</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
                    <br />

                    <label>Mobile</label>
                    <input type="number" className="form-control" value={mobile} onChange={e => setMobile(e.target.value)} />
                    <br />

                    <label>Email</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                    <br />

                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                    <br />

                    <label>Gender</label>
                    <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="">--Select Gender--</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <br />

                    <label>Qualification</label>
                    <input type="text" className="form-control" value={qua} onChange={e => setQua(e.target.value)} />
                    <br />

                    <label>Experience</label>
                    <input type="text" className="form-control" value={exp} onChange={e => setExp(e.target.value)} />
                    <br />

                    <label>Speciality</label>
                    <input type="text" className="form-control" value={spe} onChange={e => setSpe(e.target.value)} />
                    <br />

                    <label>Address</label>
                    <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
                    <br />

                    <input type="submit" value="Update" className="form-control btn btn-primary" />
                </form>
            </div>
        </div>
    );
}

export default Editdoc;
