const knex = require("../db/connection")

const tableName = "tables";

//Create a new table
function create(table) {
  return knex(tableName)
    .insert(table)
    .returning("*");
}

//Read a given table Id
function read(table_id) {
  return knex(tableName)
    .select("*")
    .where({table_id: table_id})
    .first();
}

//Update reservation with given ID
function updateReservation(reservation_id, status) {
  return knex("reservations")
    .where({reservation_id: reservation_id})
    .update({status: status})
}

//List tables
function list() {
  return knex(tableName)
    .select("*");
}

//Read a given reservation Id
function readReservation(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({reservation_id: reservation_id})
    .first()
}

//Occupy a table
function occupy(table_id, reservation_id) {
  return knex(tableName)
    .where({table_id: table_id})
    .update({reservation_id: reservation_id, status: "occupied"})
}

//Free a table
function free(table_id) {
  return knex(tableName)
    .where({table_id: table_id})
    .update({reservation_id: null, status: "free"})
}

module.exports = {
  list,
  create,
  read,
  occupy,
  free,
  readReservation,
  updateReservation,
};