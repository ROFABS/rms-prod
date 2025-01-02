/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  // '*': true,
  AuthController: {
    ChangePassword: ["AuthenticateUser"],
    getMe: ["AuthenticateUser"],
    completeOnboarding: ["AuthenticateUser"],
    updateOnBoardingStep: ["AuthenticateUser"],
  },
  SubscriptionController: {
    createSubscription: ["AuthenticateOwner"],
    renewSubscription: ["AuthenticateUser"],
    checkSubscriptionStatus: ["AuthenticateUser"],
  },
  PropertyController: {
    createProperty: ["AuthenticateOwner"],
    updateProperty: ["AuthenticateOwner"],
    deleteProperty: ["AuthenticateOwner"],
    getProperty: ["AuthenticateUser"],
    uploadPropertyLogo: ["AuthenticateOwner"],
    getPropertyFiles: ["AuthenticateOwner"],
    uploadPropertyFiles: ["AuthenticateOwner"],
  },
  UserController: {
    getUserList: ["AuthenticateOwner"],
    getUser: ["AuthenticateUser"],
    getUsersByRole: ["AuthenticateUser"],
    createUser: ["AuthenticateOwner"],
    updateUser: ["AuthenticateUser"],
    deleteUser: ["AuthenticateOwner"],
    uploadUserLogo: ["AuthenticateUser"],
  },
  DayCloseController: {
    startDay: ["AuthenticateUser"],
    endDay: ["AuthenticateUser"],
    continueDay: ["AuthenticateUser"],
  },
};
