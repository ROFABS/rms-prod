require("dotenv").config();
const Validator = require("validatorjs");
const UUIDv4 = require("uuid");

const ResponseCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
const Roles = {
  ADMIN: "admin",
  OWNER: "owner",
  MANAGER: "manager",
  CHEF: "chef",
  STEWARD: "steward",
  KITCEHN_SUPERVISOR: "kitchen_supervisor",
  KITCHEN_ASSISTANT: "kitchen_assistant",
  CASHIER: "cashier",
  ACCOUNTANT: "accountant",
  MARKETING_MANAGER: "marketing_manager",
  REVENUE_MANAGER: "revenue_manager",
  SALES_MANAGER: "sales_manager",
  OPERATIONS_MANAGER: "operations_manager",
};
const TaxLogics = {
  PERCENT: "percent",
  PER_ROOM: "per_room",
  PER_ROOM_PER_NIGHT: "per_room_per_night",
  PER_PERSON: "per_person",
  PER_PERSON_PER_NIGHT: "per_person_per_night",
  PER_NIGHT: "per_night",
  PER_BOOKING: "per_booking",
};
const TaxTypes = {
  TAX: "tax",
  FEE: "fee",
  CITY_TAX: "city tax",
};
const InternetAccessType = {
  NONE: "none",
  WIFI: "wifi",
  WIRED: "wired",
};
const InternetAccessCoverage = {
  ENTIRE_PROPERTY: "entire_property",
  PUBLIC_AREAS: "public_areas",
  ALL_ROOMS: "all_rooms",
  SOME_ROOMS: "some_rooms",
  BUSINESS_CENTRE: "business_centre",
};
const ParkingType = {
  ON_SITE: "on_site",
  NEARBY: "nearby",
  NONE: "none",
};
const WebhookUrl = "https://d27a-119-252-204-76.ngrok-free.app";

module.exports.constants = {
  Validator,
  ResponseCodes,
  Roles,
  uuidv4: UUIDv4.v4,
  TaxLogics,
  TaxTypes,
  InternetAccessType,
  InternetAccessCoverage,
  ParkingType,
  WebhookUrl,
};
