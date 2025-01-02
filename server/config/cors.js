// module.exports.cors = {
//     allRoutes: true,
//     allowOrigins: ['https://'],
//     allowCredentials: false,
//     allowRequestMethods: 'GET,PUT,POST,OPTIONS,HEAD',
//     allowRequestHeaders: 'content-type'
//   };
module.exports.cors = {
  allRoutes: true,  // Allow CORS for all routes (can be customized to specific routes if necessary)
  allowOrigins: ['http://localhost:5173'],  // Allow requests from your frontend app
  allowCredentials: true, // Allow credentials (cookies, authorization headers, etc.)
   // Specify allowed response headers
};
