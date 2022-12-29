const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation

//Check for data object
async function validateData(req, res, next) {
  if (!req.body.data) {
    return next({status:400, message: "Body must include a data object"})
  }

  next();
}

//Check for required information
async function validateBody(req, res, next) {
  if (!req.body.data.table_name || req.body.data.table_name === "") {
    return next({status:400, message: "'table_name' field cannot be empty"})
  }

  if (req.body.data.table_name.length < 2) {
    return next({status: 400, message: "'table_name' field must be at least 2 characters",})
  }

  if (!req.body.data.capacity || req.body.data.capacity === "") {
    return next({status: 400, message: "'capacity' field cannot be empty"})
  }

  if (typeof req.body.data.capacity !== "number") {
    return next({status: 400, message: "'capacity' must be a number"})
  }

  if(req.body.data.capacity < 1) {
    return next({status: 400, message: "'capacity' field must be at least 1"})
  }

  next()
}

//Check for reservation Id
async function validateReservationId(req, res, next) {
  const {reservation_id} = req.body.data;

  if (!reservation_id) {
    return next({status: 400, message: `reservation_id field must be included in the body`,})
  }

  const reservation = await service.readReservation(Number(reservation_id))

  if (!reservation) {
    return next({status: 404, message: `reservation_id ${reservation_id} does not exist`, })
  }

  res.locals.reservation = reservation;
  next()
}

//Check for table Id
async function validateTableId(req, res, next) {
  const {table_id} = req.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({status: 404, message: `table_id ${table_id} does not exist`,})
  }
  res.locals.table = table;
  next();
}

//Set table to occupied BEFORE seating table
async function validateSeatedTable(req, res, next) {
  if (res.locals.table.status !== "occupied") {
    return next({status: 400, message: "This table is not occupied"})
  }

  next();
}

//Check for valid status and capacity of reservation

async function validateSeat(req, res, next) {
  if (res.locals.table.status === "occupied") {
    return next({status: 400, message: "The table selected is currently occupied"})
  }

  if(res.locals.reservation.status === "seated") {
    return next({status: 400, message: "The reservation selected is already seated"})
  }

  if(res.locals.table.capacity < res.locals.reservation.people) {
    return next({status: 400, message: `The table selected does not have enough space to seat ${res.locals.reservation.people} people`})
  }

  next();
}

// HANDLERS

//Table creation
async function create(req, res) {
  if (req.body.data.reservation_id) {
    req.body.data.status = "occupied";
    await service.updateReservation(req.body.data.reservation_id, "seated");
  } else {
    req.body.data.status = "free";
  }

  const reservation = await service.create(req.body.data);
  res.status(201).json({data: reservation[0] });
}

//List tables on dashboard
async function list(req, res) {
  const reservation = await service.list();
  res.json({data: reservation});
}

//Update table when seated

async function update(req, res) {
  await service.occupy(
    res.locals.table.table_id,
    res.locals.reservation.reservation_id
  );
  await service.updateReservation(
    res.locals.reservation.reservation_id,
    "seated"
  );

  res.status(200).json({data: {status: "seated"}});
}

//Finish table
async function destroy(req, res) {
  await service.updateReservation(
    res.locals.table.reservation_id,
    "finished"
  );
  await service.free(res.locals.table.table_id);
  res.status(200).json({data: {status: "finished"} })
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