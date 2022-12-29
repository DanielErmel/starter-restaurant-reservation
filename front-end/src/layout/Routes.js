import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservationsComponent from "../newReservations/NewReservationsComponent";
import NewTable from "../tables/NewTable";
import SeatComponent from "../newReservations/SeatComponent";
import SearchComponent from "../newReservations/SearchComponent"
import EditReservationsComponent from "../newReservations/EditReservationsComponent";
import useQuery from "../utils/useQuery";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery()
  const date = query.get("date") || today()
  
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date} />
      </Route>
      <Route path="/reservations/new">
        <NewReservationsComponent />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatComponent />
      </Route>
      <Route path="/tables/new">
        <NewTable />
      </Route>
      <Route path="/search">
        <SearchComponent/>
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservationsComponent />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;