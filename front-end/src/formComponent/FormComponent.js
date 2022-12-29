import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router";

export default function FormComponent({
  errors,
  newReservation,
  setNewReservation,
  submitHandler,
  title
}) {
  
  const history = useHistory();

  const onChange = (event) => {
    const { target } = event;
    const value = target.value;
    setNewReservation({ ...newReservation, [target.name]: value });
  };

  return (
    <div>
      <h2>{title}</h2>
      <form onSubmit={(event) => submitHandler(event, newReservation)}>
        <div className="form-group">
        <label htmlFor="first_name">First Name</label>
          <input
            required
            name="first_name"
            value={newReservation.first_name}
            placeholder={"First Name"}
            className="form-control"
            onChange={onChange}
          />
        </div>
        <div className="form-group">
        <label htmlFor="last_name">Last Name</label>
          <input
            required
            name="last_name"
            value={newReservation.last_name}
            placeholder={"Last Name"}
            className="form-control"
            onChange={onChange}
          />
        </div>
        <div 
        className="form-group"
        >
        <label htmlFor="mobile_number">Mobile Number</label>
          <input
            required
            type="tel"
            name="mobile_number"
            value={newReservation.mobile_number}
            placeholder="xxx-xxx-xxxx"
            className="form-control"
            onChange={onChange}
          />
        </div>
        <div className="form-group">
        <label htmlFor="reservation_date">Date</label>
          <input
            required
            name="reservation_date"
            type="date"
            value={newReservation.reservation_date}
            className="form-control"
            onChange={onChange}
          />
        </div>
        <div className="form-group">
        <label htmlFor="reservation_time">Time</label>
          <input
            required
            type="time"
            name="reservation_time"
            value={newReservation.reservation_time}
            className="form-control"
            onChange={onChange}
          />
        </div>
        <div className="form-group">
        <label htmlFor="people">Number of People</label>
          <input
            required
            type="number"
            name="people"
            value={newReservation.people}
            placeholder="Party Size"
            className="form-control"
            onChange={onChange}
          />
        </div>
        <ErrorAlert error={errors} />
        <button type="submit" 
        className="btn btn-primary"
        >Submit</button>

        <button
          data-reservation-id-cancel={newReservation.reservation_id}
          type="button"
          className="btn btn-secondary ml-1"
          onClick={() => {
            history.go("-1");
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}