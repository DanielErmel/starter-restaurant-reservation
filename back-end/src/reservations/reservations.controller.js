const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation

// check for a reservation creation
// US 01 - Check for a text body, and check that all fields are correctly entered
async function validateData(request, res, next) {
  if (!request.body.data) {
    return next({status: 400, message: "Body must include a data object"});
  }
  next();
}

async function validateBody(req, res, next) {
  const required = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of required) {
    if (!req.body.data.hasOwnProperty(field) || req.body.data[field] === "") {
      return next({status: 400, message: `Field required: '${field}'`});
    }
  }

  if (Number.isNaN(Date.parse(`${req.body.data.reservation_date} ${req.body.data.reservation_time}`))) {
    return next({status: 400, message: "'reservation_date' or 'reservation_time' field is not in the correct format", })
  }

  if (typeof req.body.data.people !== "number") {
    return next({status: 400, message: "Number required in 'people' field"});
  }

  if (req.body.data.people < 1) {
    return next({status: 400, message: "Must be at least 1 person in 'people' field"});
  }

  if (req.body.data.status && req.body.data.status !== "booked") {
    return next({status: 400, message: `'status' cannot be ${req.body.data.status}`,});
  }

  if (/^[0-9\-]+$/.test(request.body.data.mobile_number) === false ) {
    return next({status: 400, message: "'mobile_number' field must be a number"})
  }

  next();

}

//US 02, check for validation of future date/time properness

async function validateDate(req, res, next) {
  const reservationDate = new Date(`${request.body.data.reservation_date}T${request.body.data.reservation_time}:00.000`);

  const today = new Date();

  if (reservationDate.getDay() === 2) {
    return next({status: 400, message: "Restaurant is closed on Tuesday",})
  }

  if (reservationDate < today) {
    return next({status:400, message: "Reservation must be made for a future date and time",})
  }

  if (reservationDate.getHours() < 10 || (reservationDate.getHours() === 10 && reservationDate.getMinutes() < 30)) {
    return next({status: 400, message: "Restaurant is not open until 10:30AM",})
  }

  if(reservationDate.getHours() > 22 || (reservationDate.getHours() === 22 && reservationDate.getMinutes() >= 30)) {
    return next({status: 400, message: "Restaurant is closed after 10:30PM", })
  }

  if (reservationDate.getHours() > 21 || (reservationDate.getHours() === 21 && reservationDate.getMinutes() > 30)) {
    return next({status: 400, message: "Reservation must be made at or before 9:30PM"})
  }

  next();
}

// return data with a given reservation ID
async function validateReservationId(req, res, next) {
  const {reservation_id} = req.params;
  const reservation = await service.read(Number(reservation_id));
  if (!reservation) {
    return next({status: 404, message: `${reservation_id} does not exist`, });
  }
  res.locals.reservation = reservation;
  next();
}

// validating reservation status
async function validateUpdateBody(req, res, next) {
  if (!req.body.data.status) {
    return next({status: 400, message: "Body must include a status" })
  }

  if (req.body.data.status !== "booked" && req.body.data.status !== "seated" && req.body.data.status !== "finished" && req.body.data.status !== "cancelled") {
    return next({status: 400, message: `Status field cannot be ${req.body.data.status}`, })
  }

  if(res.locals.reservation.status === "finished") {
    return next({status: 400, message: `Unable to update a finished reservation`,});
  }

  next();
}

/**
 * List handlers for reservation resources
 */

async function list(req, res) {
  const date = req.query.date;
  const mobile = req.query.mobile_number;
  const reservations = await service.list(date, mobile);
  const reservation = reservations.filter((reservation) => reservation.status !== "finished");
  res.json({data: reservation });
}

async function create(req, res) {
  req.body.data.status = "booked";
  const reservation = await service.create(req.body.data);
  res.status(201).json({data: reservation[0]})
}

async function update(req, res) {
  await service.update(
    res.locals.reservation.reservation_id, req.body.data.status
  )
  res.status(200).json({data: {status: req.body.data.status}});
}

async function edit(req, res) {
  const reservation = await service.edit(res.locals.reservation.reservation_id, req.body.data);
  res.status(200).json({data: reservation[0]})
}

async function read(req, res) {
  res.status(200).json({data:res.locals.reservation});
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [ 
    asyncErrorBoundary(validateData), 
    asyncErrorBoundary(validateDate), 
    asyncErrorBoundary(validateBody), 
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateUpdateBody),
    asyncErrorBoundary(update),
  ],
  edit: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(edit),
  ],
  read: [
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(read),
  ]
};
