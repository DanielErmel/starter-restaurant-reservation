import { useState } from "react";
import { useHistory } from "react-router";
import { createTable } from "../utils/api"
import ErrorAlert from "../layout/ErrorAlert";

export default function NewTable(){
    const history = useHistory();
    const [tables, setTables] = useState([])
    const [errors, setErrors] = useState(null)
    const [newTable, setNewTable] = useState({
        table_name: "",
        capacity: "",
    })

    const onChange = (event) => {
    const { target } = event;
    const value = target.value;
    setNewTable({...newTable, [target.name]: value});
    console.log("value", newTable, [target.name], value)
    }

    const submitHandler = (event) => {
    event.preventDefault();
    newTable.capacity = Number(newTable.capacity);
    createTable(newTable)
    .then((updatedTable)=>{
        setTables([...tables,updatedTable])
    })
    .then(() => history.push("/"))
    .catch(setErrors)
    }



    return (
        <div>
        <h2>Create Table</h2>
        <form onSubmit={submitHandler}>
            <div className="form-group">
            <label htmlFor="table_name">Table Name</label>
            <input 
            name="table_name"
            type="string"
            value={newTable.table_name}
            className="form-control"
            placeholder="#3"
            onChange={onChange}
            />
            </div>
            <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input 
            name="capacity"
            type="number"
            value={newTable.capacity}
            className="form-control"
            placeholder="Party Size"
            onChange={onChange}
            />
            </div>  
            <button type="submit" className="btn btn-primary">Submit</button>          
            <button type="button" className="btn btn-secondary ml-1" onClick={() => history.go(-1)}
            >Cancel</button>     
            <ErrorAlert error={errors}/>     
        </form>
        </div> 
)
}