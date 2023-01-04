const {table} = require("../db/connection");
const knex = require("../db/connection");
const tableName = "reservations";

//New reservation creation
function create(reservation) {
  return knex(tableName)
    .insert(reservation)
    .returning("*")
}
//Read with given ID
function read(reservation_id) {
  return knex(tableName)
    .select("*")
    .where({reservation_id: reservation_id})
    .first();
}
//Update reservation with ID
function update(reservation_id, status) {
  return knex(tableName)
    .where({reservation_id: reservation_id})
    .update({status: status});
}
//Edit with given ID
function edit(reservation_id, reservation) {
  return knex(tableName) 
  .where( { reservation_id: reservation_id })
  .update({ ...reservation })
  .returning("*")
}

//List all matching reservations by date/number
function list(date, mobile_number) {
  if(date) {
    return knex(tableName)
      .select("*")
      .where({reservation_date: date})
      .orderBy("reservation_time", "asc")
  }

  if(mobile_number) {
    return knex(tableName)
      .select("*")
      .where("mobile_number", "like", `${mobile_number}%`);
  }

  return knex(tableName)
    .select("*")
}

module.exports = {
  list,
  create,
  read,
  update,
  edit,
};