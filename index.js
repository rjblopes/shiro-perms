const { deepEqual } = require('hoek')
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
   * Creates new ShiroPerms object from a Trie object in bin format (msgpack5)
   * @param  {Buffer} data
   * @return {ShiroPerms}
   */
  static fromBin(data) {
    const shiroPerms = new ShiroPerms();
    return shiroPerms.loadBin(data);
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
    return this._claims();
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
    return this._compactClaims().join(' ');
  }

  /**
   * Set internal Trie object. Useful to import permission dumps or
   * an external Trie object.
   * Accept Trie object in JSON format
   * @param  {Object|String} [trie={}] Trie object or JSON string to load
   * @return {ShiroPerms} this
   */
  load(trie = {}) {
    try {
      this._trie = typeof trie === 'string' ?
      JSON.parse(trie) :
      { ...trie };
    } catch (e) {
      this._trie = {};
    }

    return this;
  }

  /**
   * Dumps current Trie to JSON.
   * @return {String} Trie in JSON format
   */
  dump() {
    return JSON.stringify(this._trie);
  }

  /**
   * Dumps current Trie to bin format (msgpack5).
   * @return {Buffer}
   */
  dumpBin() {
    return encode(this._trie);
  }

  /**
   * Loads Trie from a bin format data (msgpack5)
   * @param  {Buffer} data Data to load
   * @return {ShiroPerms}
   */
  loadBin(data) {
    try {
      this._trie = decode(data);
    } catch (e) {
      this._trie = {};
    }
    return this;
  }

  //////////////////////
  // Internal Methods //
  //////////////////////

  /**
   * Method to add a branch in a node of the Trie.
   * This discards or overwrite redudant branches.
   * @private
   * @param  {Object}   node          Root node
   * @param  {String[]} [elements=[]] Child nodes elements
   * @param  {Object}   [parentNode] Parent trie node
   * @param  {String}   [parentTerm] Parent trie node term
   */
  _insertChild(node, elements = [], parentNode, parentTerm) {
    const parts = [ ...elements ];
    const part = parts.shift();

    if (part) {
      part.split(',').forEach((term) => {
        // Check redundacy
        if (
          node['*'] &&
          ( !Object.keys(node['*']).length || !!node['*'][parts[0]] )
        ) {
          // discard since new terms are redundant
          return;
        }

        // Deals with last part of new claim
        if (!parts.length) {
          if (term === '*') {
            // overwrite parent node or the whole trie
            parentTerm ?
              parentNode[parentTerm] = { '*': {} } :
              this._trie = { '*': {} };
            return;
          }
          // last part. add * term if not itself and
          // overwrite child node
          node[term]= { '*': {} };
          return;
        }

        // Deals with middle terms in new claim

        // Adding a '*' in the middle
        if (term === '*') {
          // discard already existing redundant terms in the trie
          const newTerms = {};
          Object.keys(node).forEach((key) => {
            Object.entries(node[key]).forEach(([subKey, val]) => {
              if (subKey !== parts[0]) {
                if (!newTerms[key]) {
                  newTerms[key] = {};
                }
                newTerms[key][subKey] = val;
              }
            })
          });

          newTerms['*'] = node['*'] || {};
          // 'node' assignment is required to overwrite also the current
          // processing node
          parentNode[parentTerm] = node = newTerms;
        }

        // Adding other than '*' terms
        if (!node[term]) {
          // adds new term
          node[term] = {};
        }

        this._insertChild(node[term], parts, node, term);
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

  /**
   * Method used to transverse the trie and produce a list of claims.
   * Reversed option is used internally to produce a compact list of claims.
   * @param  {Boolean} [reversed=false] If true, claims are output in backwards
   * @return {String[]} List of claims present in the trie
   */
  _claims(reversed = false) {
    const allClaims = [];
    // Internal method to flat the trie into an array of strings
    const reduce = (claim, node) => {
      const claims = Object.keys(node);
      if (!claims.length) {
        allClaims.push(!reversed ? claim : claim.slice(2) || claim);
        return;
      }
      claims.forEach((part) => {
        reduce(
          !reversed ? `${claim}:${part}` : `${part}:${claim}`,
          node[part]
        );
      });
    };

    Object.keys(this._trie).forEach((part) => {
      reduce(part, this._trie[part]);
    });
    return allClaims;
  }

  _compactClaims() {
    // List of inverted claims
    const _reverse = this._claims(true);
    const _inverted = ShiroPerms.from(_reverse);

    _inverted._trie = compress(_inverted.trie);
    return _inverted._claims(true);
  }
}

/**
 * Recursive method to compute a compressed trie object.
 * The resulting trie is not suitable for permission checks.
 * Used internally to produce a compact string representation of
 * claims in the trie.
 * @private
 * @param  {Object} node Root trie node
 * @return {Object} New trie object
 */
function compress(node) {
  const _out = {};
  let _keys = Object.keys(node);

  while (_keys.length > 0) {
    // Working key
    const _key = _keys.pop();
    // Keys that will be written to the output
    const _commonKeys = [_key];
    // Key left for next iteration
    const _nextKeys = [];

    // Compare with other keys
    _keys.forEach((_otherKey) => {
      if (deepEqual(node[_key], node[_otherKey])) {
        // Redudant. Can be compacted
        _commonKeys.push(_otherKey);
      } else {
        // Left for next iteration
        _nextKeys.push(_otherKey);
      }
    });

    // Write common key
    _out[_commonKeys.join(',')] = compress(node[_key]);

    // Prepare next iteration
    _keys = _nextKeys;
  }

  return _out;
}

module.exports = ShiroPerms;
