import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, updateTable } from "../utils/api";

export default function SeatComponent(){
const history = useHistory();
const [tableId, setTableId] = useState();
const [tablesError, setTablesError] = useState(null);
const [tables, setTables] = useState([]);

let params = useParams();
let reservation_id = params.reservation_id;

    useEffect(loadTables, []);
    function loadTables() {
      const abortController = new AbortController();
      setTablesError(null);
      listTables(abortController.signal)
        .then(setTables)
        .catch(setTablesError);
      return () => abortController.abort();
    }

    const tablesForm = tables.map((table) => {
        return (
            <option key={table.table_id} value={table.table_id}>
            {table.table_name} - {table.capacity}
            </option>
        )
    })

    const onChange = (event) => {
        const { target } = event;
        const value = target.value;

        setTableId(value)
        console.log("line 38", value, [target.name], )
    }

    const submitHandler = (event) => {
        event.preventDefault();
        if(tableId){
        updateTable(tableId, reservation_id)
        .then(() => history.push("/")) 
        .catch(setTablesError) ;
        }
    };

    return (
        <div>
        <h2>Select Your Seat According to Party Size</h2>    
        <form name="seat-party" onSubmit={submitHandler}>
        <div className="form-group">
        <label htmlFor="table_id">Table number:</label>
            <select className="ml-2 form-control w-50" required name="table_id" onChange={onChange}>
                <option>Select a Table</option>
                {tablesForm}
            </select>
        </div>
            <button className="btn btn-primary" type="submit">Submit</button>
            <button className="btn btn-secondary ml-1" type="button" onClick={() => history.go(-1)}
            >Cancel</button>
            <ErrorAlert error={tablesError} />
        </form>
        </div>
    )
}