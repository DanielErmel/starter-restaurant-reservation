import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import FormComponent from "../formComponent/FormComponent";
import { updateRes, editRes } from "../utils/api";
import { formatAsDate } from "../utils/date-time";

export default function EditReservationsComponent() {
    const title = "Edit Your Reservation"
    const history = useHistory();
    const params = useParams();
    const [newReservation, setNewReservation] = useState({
      first_name: "",
      last_name: "",
      mobile_number: "",
      reservation_date: "",
      reservation_time: "",
      people: "",
    }); 
    const [errors, setErrors] = useState(null);
  
    useEffect(loadDashboard, [params.reservation_id]);
  
    function loadDashboard() {
      const abortController = new AbortController();
      setErrors(null);
      editRes(params.reservation_id, abortController.signal)
        .then((reservation) => setNewReservation({ 
          ...reservation,
          reservation_date: formatAsDate(reservation.reservation_date)
         }))
        .catch(setErrors);
      return () => abortController.abort();
    }
  
    const submitHandler = (event, newReservation) => {
      event.preventDefault();
      newReservation.people = Number(newReservation.people);
      newReservation.reservation_date = formatAsDate(newReservation.reservation_date)
      updateRes(params.reservation_id, newReservation)
        .then(() => {
          console.log("38")
          history.push(`/dashboard/?date=${newReservation.reservation_date}`)
    })
        .catch((errors) => console.log("string", errors));
    };
  
    return (
      <FormComponent
        submitHandler={submitHandler}
        newReservation={newReservation}
        setNewReservation={setNewReservation}
        errors={errors}
        title={title}
      />
    );
  }