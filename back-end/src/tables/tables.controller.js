const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation

//Check for data object
async function validateData(request, response, next) {
  if (!request.body.data) {
    return next({status:400, message: "Body must include a data object"})
  }

  next();
}

//Check for required information
async function validateBody(request, response, next) {
  if (!request.body.data.table_name || request.body.data.table_name === "") {
    return next({status:400, message: "'table_name' field cannot be empty"})
  }

  if (request.body.data.table_name.length < 2) {
    return next({status: 400, message: "'table_name' field must be at least 2 characters",})
  }

  if (!request.body.data.capacity || request.body.data.capacity === "") {
    return next({status: 400, message: "'capacity' field cannot be empty"})
  }

  if (typeof request.body.data.capacity !== "number") {
    return next({status: 400, message: "'capacity' must be a number"})
  }

  if(request.body.data.capacity < 1) {
    return next({status: 400, message: "'capacity' field must be at least 1"})
  }

  next()
}

//Check for reservation Id
async function validateReservationId(request, response, next) {
  const {reservation_id} = request.body.data;

  if (!reservation_id) {
    return next({status: 400, message: `reservation_id field must be included in the body`,})
  }

  const reservation = await service.readReservation(Number(reservation_id))

  if (!reservation) {
    return next({status: 404, message: `reservation_id ${reservation_id} does not exist`, })
  }

  response.locals.reservation = reservation;
  next()
}

//Check for table Id
async function validateTableId(request, response, next) {
  const {table_id} = request.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({status: 404, message: `table_id ${table_id} does not exist`,})
  }
  response.locals.table = table;
  next();
}

//Set table to occupied BEFORE seating table
async function validateSeatedTable(request, response, next) {
  if (response.locals.table.status !== "occupied") {
    return next({status: 400, message: "This table is not occupied"})
  }

  next();
}

//Check for valid status and capacity of reservation

async function validateSeat(request, response, next) {
  if (response.locals.table.status === "occupied") {
    return next({status: 400, message: "The table selected is currently occupied"})
  }

  if(response.locals.reservation.status === "seated") {
    return next({status: 400, message: "The reservation selected is already seated"})
  }

  if(response.locals.table.capacity < response.locals.reservation.people) {
    return next({status: 400, message: `The table selected does not have enough capacity to seat ${response.locals.reservation.people} people`})
  }

  next();
}

// HANDLERS

//Table creation
async function create(request, response) {
  if (request.body.data.reservation_id) {
    request.body.data.status = "occupied";
    await service.updateReservation(request.body.data.reservation_id, "seated");
  } else {
    request.body.data.status = "free";
  }

  const reservation = await service.create(request.body.data);
  response.status(201).json({data: reservation[0] });
}

//List tables on dashboard
async function list(request, response) {
  const reservation = await service.list();
  response.json({data: reservation});
}

//Update table when seated

async function update(request, response) {
  await service.occupy(
    response.locals.table.table_id,
    response.locals.reservation.reservation_id
  );
  await service.updateReservation(
    response.locals.reservation.reservation_id,
    "seated"
  );

  response.status(200).json({data: {status: "seated"}});
}

//Finish table
async function destroy(request, response) {
  await service.updateReservation(
    response.locals.table.reservation_id,
    "finished"
  );
  await service.free(response.locals.table.table_id);
  response.status(200).json({data: {status: "finished"} })
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateSeatedTable),
    asyncErrorBoundary(destroy),
  ],
}