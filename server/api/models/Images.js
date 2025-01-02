/**
 * Images.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    url: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    author: {
      type: "string",
      required: true,
    },
    kind: {
      type: "string",
    },
    position: {
      type: "number",
    },
    property: {
      type: "string",
    },
    room: {
      type: "string",
    },
    booking: {
      type: "string",
    },
  },
};
