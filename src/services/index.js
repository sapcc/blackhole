/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Api Token Authorization:
 *       type: apiKey
 *       in: header
 *       name: X-AUTH-TOKEN
 *       description: |
 *         ### HEADER
 *
 *         X-AUTH-TOKEN: ApiKey + "." + Signature + "." + Timestamp;
 *
 *         ### Lettering
 *         Signature = Base64( HMAC-SHA256( ApiSecret, Timestamp  ) );
 *
 *         Timestamp = random Unix Timestamp between now + 1 minute and now + 2 hours 
 *       
 *         Timestamp is the **expiration time** of this token! It is used on the server side 
 *         to check the validity of the token. Short-lived tokens increase safety!
 *         ### Example
 *         X-AUTH-TOKEN: ababa0c5-b5e3-3930-3b7b-9087d39376e8.MG+YAqz8Va8y+9hRoWC9CQX848uoF916vNf0xir1fQA=.1553266635
 *        
 *         How to create HMAC-SHA256 Token: https://github.com/danharper/hmac-examples
 *
 *   parameters:
 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         example: '?page=2'
 *     per_page:
 *       in: query
 *       name: per_page
 *       schema:
 *         type: integer
 *         maximum: 500
 *         minimum: 1
 *         default: 50
 *         example: '?per_page=20'
 *       
 *   responses:
 *     Unauthorized:
 *       description: Api token is missing or invalid
 *       headers:
 *         WWW-Authenticate:
 *           schema:
 *             type: string
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     UnexpectedError:
 *       description: Unexpected error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
*     Forbidden:
*       description: Action forbidden
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Error'
*   schemas:
*     # Schema for error response body
*     Error:
*       type: object
*       properties:
*         code:
*           type: string
*         message:
*           type: string
*     
*     Metadata:
*       type: object
*       properties:
*         page: 
*           type: integer
*         per_page: 
*           type: integer
*         page_count: 
*           type: integer
*         total_count:
*           type: integer
*         links:
*           type: array
*           itiems: 
*             type: object
*             properties:
*               self: 
*                 type: string
*               first:
*                 type: string
*               previous:
*                 type: string
*               next:
*                 type: string
*               last: 
*                 type: string
*       example:
*         page: 5
*         per_page: 20
*         page_count: 20
*         total_count: 521
*         links: [
*           { "self": "/resource?page=5&per_page=20" },
*           { "first": "/resource?page=1&per_page=20" },
*           { "previous": "/resource/?page=4&per_page=20" },
*           { "next": "/resource?page=6&per_page=20" },
*           { "last": "/resource?page=20&per_page=20" }
*         ]
* security:
*   - ApiKeyAuth: []
*/


const clients = require('./clients/clients.service.js')
const alerts = require('./alerts/alerts.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(clients)
  app.configure(alerts)
}
