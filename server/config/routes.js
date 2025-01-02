/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at views/homepage.ejs your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an index.html file in your         *
   * assets directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  "/": { view: "pages/homepage" },
  "POST /register-owner": "UserController.registerOwner",
  "POST /login": "AuthController.login",
  "GET /get-me": "AuthController.getMe",
  "POST /verify-user": "AuthController.verifyUser",
  "POST /forgot-password": "AuthController.forgotPassword",
  "POST /reset-password": "AuthController.resetPassword",
  "POST /change-password/:id": "AuthController.changePassword",
  "POST /onboard": "AuthController.completeOnboarding",
  "PUT /onboard/step": "AuthController.updateOnBoardingStep",

  /**
   * Property Routes
   */
  "GET /property/:groupId": "PropertyController.getProperty",
  "POST /property": "PropertyController.createProperty",
  "PATCH /property/:propertyId": "PropertyController.updateProperty",
  "DELETE /property/:propertyId": "PropertyController.deleteProperty",
  "GET /property/stats": "StatsController.getStats",

  /**
   * Subscription Routes
   */

  "POST /subscription/create": "SubscriptionController.createSubscription",
  "POST /subscription/renew": "SubscriptionController.renewSubscription",
  "POST /subscription/status": "SubscriptionController.checkSubscriptionStatus",
  "POST /subscription/webhook": "SubscriptionController.handleWebhook",

  /**
   * User Routes
   */

  "GET /users/:groupId": "UserController.getUserList",
  "GET /users/role": "UserController.getUsersByRole",
  "GET /user/:id": "UserController.getUser",
  "POST /user": "UserController.createUser",
  "PATCH /user/:userId": "UserController.updateUser",
  "DELETE /user/:userId": "UserController.deleteUser",
  "POST /upload-profile-image": "UserController.uploadUserLogo",

  /**
   * Image Upload Routes
   * */

  "POST /upload-logo/:propertyId": "PropertyController.uploadPropertyLogo",
  "POST /delete-file": "PropertyController.deleteFile",
  "GET /property-images/:propertyId": "PropertyController.getPropertyFiles",
  "POST /upload-files/:propertyId": "PropertyController.uploadPropertyFiles",

  /* AUTO CREATE MAIN CATEGORIES */

  "POST /auto/createMainCategories":
    "MaterialsManagement/AutoCategoriesCreate/CreateMaterialsManagementCategoriesController.createMaterialManagementCategories",

  /* Categories Related Routes */

  "POST /createMainCategories":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.createMainCategory",
  "POST /createSubCategories":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.createSubCategory",
  "GET /getMainCategories":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.getMainCategories",
  "GET /getSubCategories":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.getSubCategories",
  "PUT /updateMainCategory/":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.updateMainCategory",
  "DELETE /deleteMainCategory/":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.deleteMainCategory",
  "PUT /updateSubCategory/":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.updateSubCategory",
  "DELETE /deleteSubCategory/":
    "MaterialsManagement/ManageMaterialCategories/CategoriesController.deleteSubCategory",

  /* Purchase Related Routes */

  "POST /purchase":
    "MaterialsManagement/InventoryManagement/CreatePurchaseOrderController.create",
  "GET /purchase":
    "MaterialsManagement/InventoryManagement/CreatePurchaseOrderController.find",
  "DELETE /purchase":
    "MaterialsManagement/InventoryManagement/CreatePurchaseOrderController.delete",
  "PUT /purchase":
    "MaterialsManagement/InventoryManagement/CreatePurchaseOrderController.update",

  /* In House Inventory Routes */

  "GET /inhouse":
    "MaterialsManagement/InHouse/InHouseManagementController.find",
  "POST /inhouse/damage":
    "MaterialsManagement/InHouse/InHouseManagementController.moveToDamagedItems",

  /* Damage Related Routes */

  "GET /damage":
    "MaterialsManagement/DamageItems/MaterialManagementDamagedItemsController.find",
  "PUT /damage":
    "MaterialsManagement/DamageItems/MaterialManagementDamagedItemsController.update",

  /* Vendors Related Routes */

  "POST /createVendor":
    "MaterialsManagement/Vendors/VendorsManagementController.createVendor",
  "GET /getVendors":
    "MaterialsManagement/Vendors/VendorsManagementController.getVendors",
  "PUT /updateVendor":
    "MaterialsManagement/Vendors/VendorsManagementController.updateVendor",
  "DELETE /deleteVendor":
    "MaterialsManagement/Vendors/VendorsManagementController.deleteVendor",

  /* Market Management Routes */
  "POST /createMarketItems":
    "MaterialsManagement/MarketManagement/MarketManagementController.createMarketItems",
  "GET /getMarketItems":
    "MaterialsManagement/MarketManagement/MarketManagementController.getMarketItems",
  "PUT /updateMarketItem":
    "MaterialsManagement/MarketManagement/MarketManagementController.updateMarketItem",
  "DELETE /deleteMarketItem":
    "MaterialsManagement/MarketManagement/MarketManagementController.deleteMarketItem",

  /* Laundry Price Related Routes */

  "POST /laundary/price":
    "MaterialsManagement/Laundry/Prices/LaundryPriceListController.createPriceList",
  "GET /laundary/price":
    "MaterialsManagement/Laundry/Prices/LaundryPriceListController.getPriceLists",
  "DELETE /laundary/price":
    "MaterialsManagement/Laundry/Prices/LaundryPriceListController.deletePriceList",
  "PUT /laundary/price":
    "MaterialsManagement/Laundry/Prices/LaundryPriceListController.updatePriceList",

  /* Items Related Routes */ // PROBARLY NOT BEING USED FOR NOW

  "POST /createItems": "ItemManagementController.createItems",
  "GET /getItems": "ItemManagementController.getItems",
  "DELETE /deleteItem": "ItemManagementController.deleteItem",
  "PUT /updateItem": "ItemManagementController.updateItem",

  /* Kitchen Related Routes */
  "POST /createKitchenUtilizationEntry": "KitchenUtilizationController.create",
  "GET /getKitchenUtilizationEntry": "KitchenUtilizationController.find",
  // "GET /getKitchenUtilizationEntry/graph":
  //   "KitchenUtilizationController.findGraph",
  "GET /getKitchenUtilizationEntry/graph/detailed":
    "KitchenUtilizationController.findGraphDetailed",
  "GET /getKitchenUtilizationEntry/graph":
    "KitchenUtilizationController.findSimplifiedGraph",

  /* Laundry Related Routes */
  "POST /laundry/out":
    "MaterialsManagement/Laundry/LaundryManagementController.createOut",
  "POST /laundry/in":
    "MaterialsManagement/Laundry/LaundryManagementController.createIn",
  "GET /laundry":
    "MaterialsManagement/Laundry/LaundryManagementController.find",

  /* House Keeping Related Routes */
  "POST /createHouseKeepingUtilizationEntry":
    "HouseKeepingManagementController.create",
  "GET /getHouseKeepingUtilizationEntries":
    "HouseKeepingManagementController.find",
  "GET /getHouseKeepingUtilizationEntries/graph/detailed":
    "HouseKeepingManagementController.findGraphDetailed",
  "GET /getHouseKeepingUtilizationEntries/graph":
    "HouseKeepingManagementController.findSimplifiedGraph",

  /* Electronics Related Routes */
  "POST /createPurchesElectronics":
    "ElectronicsManagementController.createPurchase",
  "POST /createElectronicUtilizationEntry":
    "ElectronicsManagementController.createUtilization",
  "GET /getElectronicsPurchases":
    "ElectronicsManagementController.findPurchases",
  "GET /getElectronicsUtilizations":
    "ElectronicsManagementController.findUtilizations",
  "GET /getElectronicsUtilizations/graph/detailed":
    "ElectronicsManagementController.findGraphDetailed",
  "GET /getElectronicsUtilizations/graph":
    "ElectronicsManagementController.findSimplifiedGraph",

  /* Employee Designation Related Routes */
  "GET /designations":
    "EmployeeManagement/EmployeeManagementController.fetchDesignation",

  /**
   *  Dish Main Category Related Routes
   **/

  "POST /ksr/createDishMainCategory":
    "DishMainCategoryController.createDishMainCategory",
  "PUT /ksr/updateDishMainCategory":
    "DishMainCategoryController.updateDishMainCategory",
  "DELETE /ksr/deleteDishMainCategory":
    "DishMainCategoryController.deleteDishMainCategory",
  "GET /ksr/getDishMainCategories":
    "DishMainCategoryController.getDishMainCategories",

  /**
   * KSR Table Routes
   * */

  "POST /ksr/createKsrTable": "KSRTableController.createTable",
  "GET /ksr/getKsrTables": "KSRTableController.getTable",
  "DELETE /ksr/deleteKsrTable": "KSRTableController.deleteTable",

  /**
   * KSR Dish Routes
   **/

  "POST /ksr/createDishInventory": "KSRDishInventoryController.create",
  "GET /ksr/inventory": "KSRDishInventoryController.get",
  "DELETE /ksr/deleteDishInventory": "KSRDishInventoryController.delete",
  "PUT /ksr/updateDishInventory": "KSRDishInventoryController.update",

  /**
   * KSR Restaurant Routes
   **/

  "POST /ksr/restaurants": "KSRRestaurantsManagementController.create",
  "PUT /ksr/restaurants": "KSRRestaurantsManagementController.update",
  "GET /ksr/restaurants": "KSRRestaurantsManagementController.fetch",
  "DELETE /ksr/restaurants": "KSRRestaurantsManagementController.delete",

  /**
   * KSR Order Routes
   **/

  "POST /ksr/createOrder": "KSROrderController.create",
  "GET /ksr/getOrders": "KSROrderController.find",
  "DELETE /ksr/orders": "KSROrderController.cancelKot",
  "GET /ksr/receipt": "KSROrderController.ksrOrderReceipt",
  "GET /ksr/receipt/final": "KSROrderController.printFinalBill",
  "GET /ksr/download/excel": "KSROrderController.KsrOrdersDownloadExcel",
  "GET /ksr/day-close": "KSROrderController.getDayClose",

  /**
   * KSR Order Products
   * */

  // "POST /ksr/order/products": "KSROrderProductsController.create",
  // "GET /ksr/order/products": "KSROrderProductsController.find",
  "DELETE /ksr/order/products": "KsrOrderProductsController.delete",

  /**
   * KSR Table Session Routes
   * */
  "GET /ksr/session": "KsrTableSessionController.fetchOne",
  "GET /ksr/session/all": "KsrTableSessionController.fetch",
  "GET /ksr/session/active": "KsrTableSessionController.fetchActive",
  "GET /ksr/session/payment": "KsrTableSessionController.getPayment",
  "POST /ksr/session/payment": "KsrTableSessionController.addPayment",
  "POST /ksr/session/complete": "KsrTableSessionController.completeSession",
  "POST /ksr/session/discount": "KsrTableSessionController.applyDiscount",
  "DELETE /ksr/session": "KsrTableSessionController.deleteSession",
  "GET /ksr/session/excel": "KsrTableSessionController.getExcelFile",
  "GET /ksr/session/print/final-bill":
    "KsrTableSessionController.printFinalBill",

  /**
   * Channels
   * */
  "POST /channels/swiggy": "ChannelController.updateSwiggy",
  "POST /channels/zomato": "ChannelController.updateZomato",
  "GET /channels": "ChannelController.getChannelStatus",

  /**
   * Day Close Routes
   * */
  "POST /day/start": "DayCloseController.startDay",
  "POST /day/end": "DayCloseController.endDay",
  "POST /day/continue": "DayCloseController.continueDay",
  "GET /day/open": "DayCloseController.getOpenDayClose",
  "POST /day/close": "DayCloseController.closeDayClose",

  /* Tax Management Routes */
  "POST /createTaxItem": "TaxManagementController.create",
  "GET /taxes": "TaxManagementController.find",
  "PUT /updateTaxItem": "TaxManagementController.update",
  "DELETE /tax": "TaxManagementController.delete",

  /**
   * Hotel Config Routes
   */

  // "POST /hotelconfig": "HotelConfig/HotelConfigController.create",
  // "GET /hotelconfig": "HotelConfig/HotelConfigController.get",
  // "DELETE /hotelconfig": "HotelConfig/HotelConfigController.delete",
  // "PUT /hotelconfig": "HotelConfig/HotelConfigController.update",

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
};