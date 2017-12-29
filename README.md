<a name="ShiroPerms"></a>

## ShiroPerms
Defines and checks permissions with claims written in Apache Shiro style
and use a Trie data structure for performance

**Kind**: global class  

* [ShiroPerms](#ShiroPerms)
    * [new ShiroPerms([claims])](#new_ShiroPerms_new)
    * _instance_
        * [.claims](#ShiroPerms+claims) : <code>Array.&lt;String&gt;</code>
        * [.trie](#ShiroPerms+trie) : <code>object</code>
        * [.reset()](#ShiroPerms+reset) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
        * [.add([claims])](#ShiroPerms+add) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
        * [.remove([claims])](#ShiroPerms+remove) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
        * [.check([permissions], [any])](#ShiroPerms+check) ⇒ <code>Boolean</code>
        * [.checkAny([permissions])](#ShiroPerms+checkAny) ⇒ <code>Boolean</code>
        * [.toString()](#ShiroPerms+toString) ⇒ <code>String</code>
        * [.load([trie])](#ShiroPerms+load) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
        * [.dump()](#ShiroPerms+dump) ⇒ <code>String</code>
    * _static_
        * [.from(...claims)](#ShiroPerms.from) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
        * [.fromTrie([trie])](#ShiroPerms.fromTrie) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)

<a name="new_ShiroPerms_new"></a>

### new ShiroPerms([claims])
Creates a new ShiroPerms instance with specified claims.
Claims may be added or removed later.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [claims] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | Claims to create the object with. |

<a name="ShiroPerms+claims"></a>

### shiroPerms.claims : <code>Array.&lt;String&gt;</code>
A list of current claims

**Kind**: instance property of [<code>ShiroPerms</code>](#ShiroPerms)  
<a name="ShiroPerms+trie"></a>

### shiroPerms.trie : <code>object</code>
Returns current permissions Trie object

**Kind**: instance property of [<code>ShiroPerms</code>](#ShiroPerms)  
<a name="ShiroPerms+reset"></a>

### shiroPerms.reset() ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Removes all permissions from the Trie

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
**Returns**: [<code>ShiroPerms</code>](#ShiroPerms) - this  
<a name="ShiroPerms+add"></a>

### shiroPerms.add([claims]) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Add claims to permission Trie
Accept multiple claim string with claims separated by space char ' '

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  

| Param | Type | Default |
| --- | --- | --- |
| [claims] | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <code>[]</code> | 

**Example**  
```js
// Single claim
perms.add('store:view');

// Claim array
perms.add(['store:view', 'store:edit:1234']);

// Mutiple claim string
perms.add('store:view store:edit:1234');
```
<a name="ShiroPerms+remove"></a>

### shiroPerms.remove([claims]) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Remove claims from the Trie.
Claims in Shiro compact format are not allowed, e.g. 'store:view,edit'.
Accept multiple claim string with claims separated by space char ' '

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  

| Param | Type | Default |
| --- | --- | --- |
| [claims] | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <code>[]</code> | 

<a name="ShiroPerms+check"></a>

### shiroPerms.check([permissions], [any]) ⇒ <code>Boolean</code>
Verify permissions against current Trie.
Multiple permissions input may be compared using AND/OR logic operator
controlled by 'any' parameter.
Permission in Shiro compact format are not allowed, e.g. 'store:view,edit'.
Accept multiple claim string with claims separated by space char ' '

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
**Returns**: <code>Boolean</code> - Allowed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [permissions] | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <code>[]</code> | Permisssions to be checked |
| [any] | <code>Boolean</code> | <code>false</code> | If true, checks for any permission (OR). Checks all permissions otherwise (AND) |

<a name="ShiroPerms+checkAny"></a>

### shiroPerms.checkAny([permissions]) ⇒ <code>Boolean</code>
Verify ANY permissions against current Trie.
Alias of 'check()' method with flag 'any' set to false.
Permission in Shiro compact format are not allowed, e.g. 'store:view,edit'.
Accept multiple claim string with claims separated by space char ' '

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
**Returns**: <code>Boolean</code> - Allowed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [permissions] | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <code>[]</code> | Permisssions to be checked |

<a name="ShiroPerms+toString"></a>

### shiroPerms.toString() ⇒ <code>String</code>
Print current claims in single string format

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
<a name="ShiroPerms+load"></a>

### shiroPerms.load([trie]) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Set internal Trie object. Useful to import permission dumps or
an external Trie object.
Accept Trie object in JSON format

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
**Returns**: [<code>ShiroPerms</code>](#ShiroPerms) - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [trie] | <code>Object</code> \| <code>String</code> | <code>{}</code> | Trie object or JSON string to load |

<a name="ShiroPerms+dump"></a>

### shiroPerms.dump() ⇒ <code>String</code>
Dumps current Trie to JSON.

**Kind**: instance method of [<code>ShiroPerms</code>](#ShiroPerms)  
**Returns**: <code>String</code> - Trie in JSON format  
<a name="ShiroPerms.from"></a>

### ShiroPerms.from(...claims) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Creates new ShiroPerms object from a list of claims

**Kind**: static method of [<code>ShiroPerms</code>](#ShiroPerms)  

| Param | Type | Description |
| --- | --- | --- |
| ...claims | <code>String</code> \| <code>Array.&lt;String&gt;</code> | Claims list |

<a name="ShiroPerms.fromTrie"></a>

### ShiroPerms.fromTrie([trie]) ⇒ [<code>ShiroPerms</code>](#ShiroPerms)
Creates new ShiroPerms object from a Trie object

**Kind**: static method of [<code>ShiroPerms</code>](#ShiroPerms)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [trie] | <code>Object</code> \| <code>String</code> | <code>{}</code> | Trie object or JSON |

