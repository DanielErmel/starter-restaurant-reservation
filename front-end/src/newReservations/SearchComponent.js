import { useState } from "react";
import {  listReservations } from "../utils/api";
import ReservationsComponent from "../dashboard/ReservationsComponent";

export default function SearchComponent(){
  const [searched, setSearched] = useState(false)
  const [reservations, setReservations] = useState([])  
  const [formData, setFormData] = useState({})
  

  const onChange = (event) => {
    const { target } = event;
    const value = target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setSearched(true)
    const abortController = new AbortController();
    listReservations( formData, abortController.signal )
    .then((response)=>setReservations(response))
    .catch((error)=>console.log(error));
    return () => abortController.abort()
  };

  return (
    <div>
    <form className="mt-2" name="search_for_number"
    onSubmit={submitHandler}
    >
    <label>
      <h2>Search by Mobile Number</h2>
    </label>
    <div className="row">
      <div className="col-lg-8 col-sm-6 col-xs-8">
      <input onChange={onChange} 
      type="search" 
      name="mobile_number" 
      className="form-control"
      placeholder="Enter a customer's phone number" 
      required />
      </div>
      <div className="col-lg-4 col-sm-6 col-xs-4 mt-1">
    <button type="submit" className="btn btn-primary">
      Find
    </button>
    </div>
    </div>
    </form>
    <div className="mt-4">
    {reservations.length !== 0 ? <ReservationsComponent reservations={reservations}/> : null}  
    {searched === true && reservations.length === 0 ? `No reservations found with this phone number` : null}
    </div>
    </div>
  )
}