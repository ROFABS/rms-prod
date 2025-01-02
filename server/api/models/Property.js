/**
 * Property.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    uniqueId: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    titleSearch: {
      type: "string",
    },
    currency: {
      type: "string",
      required: true,
    },
    property_type: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
    },
    phone: {
      type: "string",
    },
    website: {
      type: "string",
    },
    address: {
      type: "string",
    },
    landmark: {
      type: "string",
    },
    country_code: {
      type: "string",
      required: true,
    },
    timezone: {
      type: "string",
      required: true,
    },
    city: {
      type: "string",
    },
    state: {
      type: "string",
    },
    zip_code: {
      type: "string",
    },
    latitude: {
      type: "number",
    },
    longitude: {
      type: "number",
    },
    description: {
      type: "string",
    },
    photos: {
      type: "json",
      columnType: "array",
    },
    is_active: {
      type: "boolean",
      defaultsTo: true,
    },
    logo_url: {
      type: "string",
    },
    group_id: {
      type: "string",
      required: true,
    },
  },
};
