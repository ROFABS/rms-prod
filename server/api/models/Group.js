/**
 * Group.js
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
    name: {
      type: "string",
      required: true,
    },
    nameSearch: {
      type: "string",
    },
  },
  beforeUpdate: function (group, cb) {
    if (group.name) {
      group.nameSearch = group.name.toLowerCase();
      return cb();
    } else {
      return cb();
    }
  },
};
