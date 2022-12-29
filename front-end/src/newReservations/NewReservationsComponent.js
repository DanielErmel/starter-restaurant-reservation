import { useHistory } from "react-router"
import { useState } from "react";
import { createRes } from "../utils/api";
import FormComponent from "../formComponent/FormComponent";

export default function NewReservationsComponent() {
  const title = "Create Your Reservation"
  const history = useHistory();
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

const submitHandler = (event) => {
  event.preventDefault();
  reservation.people = Number(reservation.people);
  createRes(reservation)
    .then(() => {
      history.push(`/dashboard?date=${reservation.reservation_date}`)
    })
    .catch(setError)
}

return (
  <FormComponent
  submitHandler = {submitHandler}
  newReservation = {reservation}
  setNewReservation = {setReservation}
  errors = {error}
  title = {title}
  />
)
}