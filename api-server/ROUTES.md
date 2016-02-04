# FERMAT.ORG API ROUTES

Our base URL is at this moment api.fermat.org, so, any route starts with it followed by the route to use. E.g. http://api.fermat.org/v1/repo/devs

## AUTHENTICATION ROUTES

**GET** /v1/auth/login
```javascript
/**
 * @description makes login and register oaf a github user
 * @author campol
 *
 * @param req.query.code
 * @param req.query.api_key
 */
```


**GET** /v1/auth/logout
```javascript
/**
 * @description makes logout of user owner of axs_key
 * @author campol
 *
 * @param req.query.axs_key
 * @param req.query.api_key
 */
 ```



## NETWORK ROUTES

**GET** /v1/net/servrs
```javascript
/**
 * @description lists all the servers in the P2P network
 * @author kyxer
 *
 * 
 */
 ```


**GET** /v1/net/nodes/:hash/childrn
```javascript
/**
 * @description lists all the children connected to a node in the P2P network
 * @author kyxer
 *
 * @param req.params.hash
 */
 ```



## REPOSITORY ROUTES

**GET** /v1/repo/comps/reload
```javascript
/**
 * @description reloads the manifest into the database
 * @deprecated
 * @author fuelusumar
 */
 ```


**GET** /v1/repo/comps
```javascript
/**
 * @description list all the components, layer, platforms and superlayers in fermat
 * @author fuelusumar
 */
 ```


**GET** /v1/repo/devs
```javascript
/**
 * @description lists all the developers in fermat
 * @author fuelusumar
 */
 ```


**GET** /v1/repo/procs
```javascript
/**
 * @description lists all the processes in fermat
 * @author fuelusumar
 */
 ```


**GET** /v1/repo/readme
```javascript
/**
 * @description gets the fermat readme.md file
 * @author fuelusumar
 */
 ```


**GET** /v1/repo/book
```javascript
/**
 * @description gets the fermat book
 * @author kyxer
 */
 ```


**GET** /v1/repo/docs/:type
```javascript
/**
 * @description gets the fermat book in an specific format type
 * @author kyxer
 *
 * @param req.params.type
 */
 ```


**GET** /v1/repo/manifest/check
```javascript
/**
 * @description checks the syntax of the fermat manifest
 * @deprecated
 * @author kyxer
 */
 ```



### COMPONENT ROUTES

**GET** /v1/repo/usrs/:usr_id/comps
```javascript
/**
 * @description lists all the components
 * @author kyxer
 *
 * @param req.params.usr_id
 */
 ```


**POST** /v1/repo/usrs/:usr_id/comps
```javascript
/**
 * @description inserts a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.body.platfrm_id
 * @param req.body.suprlay_id
 * @param req.body.layer_id
 * @param req.body.name
 * @param req.body.type
 * @param req.body.description
 * @param req.body.difficulty
 * @param req.body.code_level
 * @param req.body.repo_dir
 * @param req.body.scrnshts
 * @param req.body.found
 */
 ```


**GET** /v1/repo/usrs/:usr_id/comps/:comp_id
```javascript
/**
 * @description gets an specific component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 */
 ```


**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id
```javascript
/**
 * @description updates a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.body.platfrm_id
 * @param req.body.suprlay_id
 * @param req.body.layer_id
 * @param req.body.name
 * @param req.body.type
 * @param req.body.description
 * @param req.body.difficulty
 * @param req.body.code_level
 * @param req.body.repo_dir
 * @param req.body.scrnshts
 * @param req.body.found
 */
 ```


**DELETE** /v1/repo/usrs/:usr_id/comps/:comp_id
```javascript
/**
 * @description removes a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 */
 ```


**POST** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs
```javascript
/**
 * @description inserts a developer inside a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.body.dev_id
 * @param req.body.role
 * @param req.body.scope
 * @param req.body.percnt
 */
 ```


**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs/:comp_dev_id
```javascript
/**
 * @description updates a developer inside a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.params.comp_dev_id
 * @param req.body.dev_id
 * @param req.body.role
 * @param req.body.scope
 * @param req.body.percnt
 */
 ```


**DELETE** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs/:comp_dev_id
```javascript
/**
 * @description deletes a developer from a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.params.comp_dev_id
 */
 ```


**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id/life-cicles
```javascript
/**
 * @description updates an life-cycle's status inside a component
 * @author kyxer
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.body.name
 * @param req.body.target
 * @param req.body.reached
 */
 ```
