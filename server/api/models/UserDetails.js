module.exports = {
  primaryKey: "uniqueId",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    uniqueId: {
      type: "string",
      required: true,
      unique: true,
    },
    address: {
      type: "string",
    },
    dateOfJoining: {
      type: "string",
    },
    department: {
      type: "string",
    },
    gender: {
      type: "string",
    },
    nokName: {
      type: "string",
    },
    nokPhone: {
      type: "string",
    },
    nokAddress: {
      type: "string",
    },
    nokRelationship: {
      type: "string",
    },
  },
};
