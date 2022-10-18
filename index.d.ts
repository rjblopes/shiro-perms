declare module 'shiro-perms' {
  declare class ShiroPerms {
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

  declare function add(perms: string | string[]): boolean
  declare function check(perms: string | string[]): boolean
  declare function checkAny(perms: string | string[]): boolean
  declare function from(perms: string | string[]): ShiroPerms
  declare function load(obj: Record<string, unknown> | string): ShiroPerms
  declare function remove(perms: string | string[]): ShiroPerms
  declare function reset(): ShiroPerms
  declare function toString(): string
}
