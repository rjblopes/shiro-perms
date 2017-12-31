
# Shiro Perms

Create, check and manipulate permissions using a Trie data object and Apache Shiro write style.

## Getting Started

Module exposes a class that can be used to create permissions objects. Each instance object represents a set of credentials which can be manipulated and verified using instance methods.   

```js
const ShiroPerms = require('shiro-perms');
```

```js
import ShiroPerms from 'shiro-perms';
```
### Documentation API

* https://rjblopes.github.io/shiro-perms

### Installing

Use:

```
npm i shiro-perms
```

Or

```
yarn add shiro-perms
```

## Running the tests

Use:

```
npm run test
```

Or

```
yarn test
```
## Usage
### Create

Using class constructor:

```js
const perms = new ShiroPerms();
```

Static methods:

```js
const perms = ShiroPerms.from('store:view,edit store:*:1123');
```
```js
const perms = ShiroPerms.from(['store:view,edit', 'store:*:1123']);
```
### Check
Check ALL permissions - AND

```js
perms.check('store:view:9999')
// True

perms.check('store:view store:edit:*')
// True

perms.check(['store:view', 'store:edit:9999'])
// False
```

Check ANY permissions - OR

```js
perms.checkAny(['store:view', 'store:edit:9999'])
// True
```

### Add
....
### Remove
...
### Reset
...

## Built With

* [msgpack5](https://github.com/mcollina/msgpack5) - A msgpack v5 implementation for node.js


## Author

* **Ricardo Lopes** - *Initial work* - [rjblopes](https://github.com/rjblopes)

## License

This project is licensed under the MIT License

## Acknowledgments

* Inspired by: https://github.com/entrecode/shiro-trie
