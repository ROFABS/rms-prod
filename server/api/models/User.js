/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const bcrypt = require("bcryptjs");
const Role = sails.config.constants.Roles;
const { uuidv4 } = sails.config.constants;

const messages = sails.config.messages;

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
    fname: {
      type: "string",
      required: true,
    },
    lname: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
      // unique: true,
    },
    phone: {
      type: "string",
    },
    password: {
      type: "string",
    },
    isActive: {
      type: "boolean",
      defaultsTo: true,
    },
    is_verified: {
      type: "boolean",
      defaultsTo: false,
    },
    password_reset_token: {
      type: "string",
    },
    company_name: {
      type: "string",
    },
    role: {
      type: "string",
      // isIn: [Role.ADMIN, Role.OWNER, Role.MANAGER, Role.CHEF, Role.ACCOUNTANT],
      defaultsTo: Role.USER,
      required: true,
    },
    group: {
      model: "group",
    },
    groupUniqueId: {
      type: "string",
      required: true,
    },
    properties: {
      type: "json",
      columnType: "array",
    },
    profile_pic: {
      type: "string",
    },
    isOnboarded: {
      type: "boolean",
      defaultsTo: false,
    },
    onboardingStep: {
      type: "number",
      defaultsTo: 0,
    },
    subscription: {
      model: "Subscription",
    },
    extraDetails: {
      model: "UserDetails",
    },
    dayStarted: {
      type: "boolean",
      defaultsTo: false,
    },
    dayEnded: {
      type: "boolean",
      defaultsTo: false,
    },
    lastLoginDate: {
      type: "string",
      allowNull: true,
    },
    lastLogoutDate: {
      type: "string",
      allowNull: true,
    },
  },

  beforeCreate: function (user, cb) {
    if (user.email !== null) {
      user.email = user.email.toLowerCase();
      user.email = user.email.trim();

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return cb(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) {
            return cb(err);
          }
          user.password = hash;
          return cb();
        });
      });
    } else {
      return cb();
    }
  },

  beforeUpdate: function (user, cb) {
    if (user.uniqueId) {
      delete user.uniqueId;
    }
    if (user.email) {
      user.email = user.email.toLowerCase();
      user.email = user.email.trim();
    }
    if (user.password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return cb(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) {
            return cb(err);
          }
          user.password = hash;

          return cb();
        });
      });
    } else {
      return cb();
    }
  },
  comparePassword: function (password, user) {
    return new Promise((resolve) => {
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          resolve(false);
        }
        if (match) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },
  validateUserLogin: async (data) => {
    let rules = {
      email: "required|email|max:50",
      password: "required|min:8",
    };
    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};
    let user = null;
    if (!data.email) {
      result["hasError"] = true;
      result["errors"] = messages.InvalidEmail;
      return result;
    }
    user = await User.findOne({
      email: data.email.toLowerCase(),
    });
    // console.log(user, "user in 2");
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
      return result;
    }

    if (!user) {
      result["hasError"] = true;
      result["errors"] = messages.InvalidEmail;
      return result;
    } else {
      const passwordFlag = await User.comparePassword(data.password, user);

      if (!passwordFlag) {
        result["hasError"] = true;
        result["errors"] = messages.InvalidCredentials;
        return result;
      }
      result["hasError"] = false;
      result["user"] = user;
    }

    return result;
  },
  validateCreateOwnerData: async (data) => {
    let rules = {
      email: "required|email|max:50",
      password: "required|string|min:8",
      // role: 'required|string|max:20|in:' + Role.OWNER + Role.ADMIN + '',
      fname: "required|string|max:20",
      lname: "required|string|max:20",
      // country_code: "string",
      // phone: "string",
      company_name: "required|string",
    };

    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};

    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },
  validateChangePasswordData: async (data) => {
    let rules = {
      currentPassword: "required|string|min:8",
      newPassword: "required|string|min:8",
    };

    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};

    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },
  validateResetPasswordData: async (data) => {
    let rules = {
      password: "required|string|min:8",
      token: "required|string|min:8",
    };

    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};

    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },

  validateCreateUserData: async (data) => {
    let rules = {
      email: "required|email|max:50",
      fname: "required|string|max:20",
      lname: "required|string|max:20",
      country_code: "string",
      phone: "string",
      properties: "array",
      role: "required|string|max:30",
    };

    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};

    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },

  validateUpdateUserData: async (data) => {
    let rules = {
      fname: "required|string|max:20",
      lname: "required|string|max:20",
      country_code: "string",
      phone: "string",
      isActive: "required|boolean",
      properties: "array",
    };

    let validation = new sails.config.constants.Validator(data, rules);
    let result = {};

    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },

  PasswordGenerator: function (len) {
    var length = len ? len : 10;
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
    var numeric = "0123456789";
    var punctuation = "@$!%*?&";
    var password = "";
    var character = "";

    while (password.length < length) {
      entity1 = Math.ceil(string.length * Math.random() * Math.random());
      entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
      hold = string.charAt(entity1);
      hold = password.length % 2 === 0 ? hold.toUpperCase() : hold;
      character += hold;
      character += numeric.charAt(entity2);
      character += punctuation.charAt(entity3);
      password = character;
    }
    password = password
      .split("")
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join("");
    return password.substr(0, len);
  },
};
