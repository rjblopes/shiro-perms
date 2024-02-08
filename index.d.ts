declare module 'shiro-perms' {
  class ShiroPerms {
    constructor(perms?: string | string[])

    add(perms: string | string[]): boolean
    check(perms: string | string[]): boolean
    checkAny(perms: string | string[]): boolean
    from(perms: string | string[]): this
    load(obj: Record<string, unknown> | string): this
    remove(perms: string | string[]): this
    reset(): this
    toString(): string
  }

  function add(perms: string | string[]): boolean
  function check(perms: string | string[]): boolean
  function checkAny(perms: string | string[]): boolean
  function from(perms: string | string[]): ShiroPerms
  function load(obj: Record<string, unknown> | string): ShiroPerms
  function remove(perms: string | string[]): ShiroPerms
  function reset(): ShiroPerms
  function toString(): string
}
