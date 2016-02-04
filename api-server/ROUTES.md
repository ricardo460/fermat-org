# FERMAT.ORG API ROUTES

## AUTHENTICATION ROUTES

```javascript
/**
 * @description 
 * @author
 *
 * @param req.query.code
 * @param req.query.api_key
 */
```
```**GET** /v1/auth/login```


```javascript
/**
 * @description 
 * @author
 *
 * @param req.query.axs_key
 * @param req.query.api_key
 */
 ```
```**GET** /v1/auth/logout```



## NETWORK ROUTES

```javascript
/**
 * @description
 * @author
 *
 * 
 */
 ```
```**GET** /v1/net/servrs```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.hash
 */
 ```
```**GET** /v1/net/nodes/:hash/childrn```



## REPOSITORY ROUTES

```javascript
/**
 * @description
 * @author 
 */
 ```
```**GET** /v1/repo/comps/reload```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/comps```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/devs```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/procs```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/readme```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/book```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.type
 */
 ```
```**GET** /v1/repo/docs/:type```


```javascript
/**
 * @description
 * @author
 */
 ```
```**GET** /v1/repo/manifest/check```



### COMPONENT ROUTES

```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 */
 ```
```**GET** /v1/repo/usrs/:usr_id/comps```


```javascript
/**
 * @description
 * @author
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
```**POST** /v1/repo/usrs/:usr_id/comps```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 */
 ```
```**GET** /v1/repo/usrs/:usr_id/comps/:comp_id```


```javascript
/**
 * @description
 * @author
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
```**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 */
 ```
```**DELETE** /v1/repo/usrs/:usr_id/comps/:comp_id```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.body.dev_id
 * @param req.body.role
 * @param req.body.scope
 * @param req.body.percnt
 */
 ```
```**POST** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs```


```javascript
/**
 * @description
 * @author
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
```**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs/:comp_dev_id```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.params.comp_dev_id
 */
 ```
```**DELETE** /v1/repo/usrs/:usr_id/comps/:comp_id/comp-devs/:comp_dev_id```


```javascript
/**
 * @description
 * @author
 *
 * @param req.params.usr_id
 * @param req.params.comp_id
 * @param req.body.name
 * @param req.body.target
 * @param req.body.reached
 */
 ```
```**PUT** /v1/repo/usrs/:usr_id/comps/:comp_id/life-cicles```
