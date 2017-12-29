const msgpack = require('msgpack5');
const { encode, decode } = msgpack();

/**
 * Defines and checks permissions with claims written in Apache Shiro style
 * and use a Trie data structure for performance
 */
class ShiroPerms {
  /**
   * Creates new ShiroPerms object from a list of claims
   * @param  {...String|String[]} claims Claims list
   * @return {ShiroPerms}
   */
  static from(...claims) {
    let allClaims = [];
    claims.forEach((claim) => {
      if (typeof claim === 'string') {
        allClaims.push(...claim.split(' '));
      } else {
        allClaims.push(...claim);
      }
    });

    return new ShiroPerms(allClaims);
  }

  /**
   * Creates new ShiroPerms object from a Trie object
   * @param  {Object|String} [trie={}] Trie object or JSON
   * @return {ShiroPerms}
   */
  static fromTrie(trie = {}) {
    const shiroPerms = new ShiroPerms();
    return shiroPerms.load(trie);
  }

  /**
   * Creates a new ShiroPerms instance with specified claims.
   * Claims may be added or removed later.
   *
   * @param  {String[]}   [claims=[]] Claims to create the object with.
   * @return {ShiroPerms}
   */
  constructor(claims = []) {
    this._trie = {};
    this.claims = claims;
  }

  /////////////////////////
  // Instance Properties //
  /////////////////////////

  /**
   * A list of current claims
   * @type {String[]}
   */
  get claims() {
    const allClaims = [];
    // Internal method to flat the trie into an array of strings
    const reduce = (claim, node) => {
      const claims = Object.keys(node);
      if (!claims.length) {
        allClaims.push(claim);
        return;
      }
      claims.forEach((part) => {
        reduce(claim + ':' + part, node[part]);
      });
    };

    Object.keys(this._trie).forEach((part) => {
      reduce(part, this._trie[part]);
    });
    return allClaims;
  }

  set claims(claims) {
    this.reset();
    this.add(claims);
  }

  /**
   * Returns current permissions Trie object
   * @type {object}
   */
  get trie() {
    return this._trie;
  }

  //////////////////////
  // Instance Methods //
  //////////////////////

  /**
   * Removes all permissions from the Trie
   * @return {ShiroPerms} this
   */
  reset() {
    this._trie = {};
    return this;
  }

  /**
   * Add claims to permission Trie
   * Accept multiple claim string with claims separated by space char ' '
   * @example
   * // Single claim
   * perms.add('store:view');
   *
   * // Claim array
   * perms.add(['store:view', 'store:edit:1234']);
   *
   * // Mutiple claim string
   * perms.add('store:view store:edit:1234');
   *
   * @param   {String|String[]} [claims=[]]
   * @return  {ShiroPerms}
   */
  add(claims = []) {
    const claimList = typeof claims === 'string' ? [...claims.split(' ')] : claims;
    claimList.forEach(claim =>
      this._insertChild(this._trie, claim.split(':'))
    );
    return this;
  }

  /**
   * Remove claims from the Trie.
   * Claims in Shiro compact format are not allowed, e.g. 'store:view,edit'.
   * Accept multiple claim string with claims separated by space char ' '
   * @param  {String|String[]} [claims=[]]
   * @return {ShiroPerms}
   */
  remove(claims = []) {
    const claimList = typeof claims === 'string' ?
      claims.split(' ') :
      claims;

    this.claims = this.claims.filter(claim =>
      !claimList.find(remove =>
        (remove === claim || remove + ':*' === claim)
      )
    );
    return this;
  }

  /**
   * Verify permissions against current Trie.
   * Multiple permissions input may be compared using AND/OR logic operator
   * controlled by 'any' parameter.
   * Permission in Shiro compact format are not allowed, e.g. 'store:view,edit'.
   * Accept multiple claim string with claims separated by space char ' '
   *
   * @param  {String|String[]} [permissions=[]] Permisssions to be checked
   * @param  {Boolean}         [any=false] If true, checks for any permission (OR).
   * Checks all permissions otherwise (AND)
   * @return {Boolean} Allowed
   */
  check(permissions = [], any = false) {
    const permsList = typeof permissions === 'string' ?
      permissions.split(' ') :
      permissions;

    const verify = perm => this._check(this._trie, perm.split(':'));

    return (
      !!Object.keys(this._trie).length &&
      (any ? permsList.some(verify) : permsList.every(verify))
    );
  }

  /**
   * Verify ANY permissions against current Trie.
   * Alias of 'check()' method with flag 'any' set to false.
   * Permission in Shiro compact format are not allowed, e.g. 'store:view,edit'.
   * Accept multiple claim string with claims separated by space char ' '
   * @param  {String|String[]} [permissions=[]] Permisssions to be checked
   * @return {Boolean} Allowed
   */
  checkAny(permissions = []) {
    return this.check(permissions, true);
  }

  /**
   * Print current claims in single string format
   * @return {String}
   */
  toString() {
    return this.claims.join(' ');
  }

  /**
   * Set internal Trie object. Useful to import permission dumps or
   * an external Trie object.
   * Accept Trie object in JSON format
   * @param  {Object|String} [trie={}] Trie object or JSON string to load
   * @return {ShiroPerms} this
   */
  load(trie = {}) {
    this._trie = typeof trie === 'string' ? JSON.parse(trie) : { ...trie };
    return this;
  }

  /**
   * Dumps current Trie to JSON.
   * @return {String} Trie in JSON format
   */
  dump() {
    return JSON.stringify(this._trie);
  }

  dumpBin() {
    return encode(this._trie).toString('base64');
  }

  //////////////////////
  // Internal Methods //
  //////////////////////

  /**
   * Method to add a branch in a node of the Trie.
   * @private
   * @param  {Object}   node          Root node
   * @param  {String[]} [elements=[]] Child nodes elements
   */
  _insertChild(node, elements = []) {
    const parts = [ ...elements ];
    const part = parts.shift();
    if (part) {
      part.split(',').forEach((term) => {
        if (!node[term]) {
          // adds new term
          node[term] = {};
        }
        if (!parts.length && term !== '*') {
          // last part. add * term if not itself
          node[term]['*'] = node[term]['*'] || {};
        } else {
          // still more parts to process
          this._insertChild(node[term], parts);
        }
      });
    }
  }

  /**
   * Method to recursively transverse the Trie and check a permission.
   * @private
   * @param  {Object}   node          Root node
   * @param  {String[]} [elements=[]] Child nodes elements
   * @return {Boolean}                Found
   */
  _check(node, elements = []) {
    if (!node) return false;

    const parts = [ ...elements ];
    const part = parts.shift();
    if (part && node[part] || node['*']) {
      // Within a matching part of a permission statement
      if (parts.length > 0) {
        // Not the last part then check another level
        return (
          this._check(node[part], parts) ||
          part !== '*' && this._check(node['*'], parts)
        );
      }
      // Last part of permission
      if (part !== '*' && !node['*']) {
        // last part is not a *. Need to test another level - implicit *
        return this._check(node[part], ['*']);
      }
      return true;
    }

    // No matching part in the permission
    // If node is empty we've reached one end of the trie -
    // i.e full match. Else no match.
    return !Object.keys(node).length;
  }
}

module.exports = ShiroPerms;
