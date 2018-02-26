const { expect } = require('chai');
const ShiroPerms = require('../index');

describe('Testing Compact Add', () => {

  describe('overwrite tests', () => {
    it('should overwrite all', () => {
      const perms = ShiroPerms.from([
        'sto:viw',
        'sto:adm:1234',
        'sto:adm:4231',
        'sto:viw:4231',
        'sto:edt:4231'
      ]);
      debugger;
      perms.add('*');

      expect(perms.claims).to.have.members(['*']);
    });

    it('should overwrite with *', () => {
      const perms = ShiroPerms.from([
        'sto:viw',
        'sto:edt',
        'sto:*:1234',
        'sto:adm:4231'
      ]);

      perms.add('sto:*');

      expect(perms.claims).to.have.members(['sto:*']);
    });

    it('should overwrite without *', () => {
      const perms = ShiroPerms.from([
        'sto:viw',
        'sto:edt',
        'sto:*:1234',
        'sto:adm:4231'
      ]);

      perms.add('sto');

      expect(perms.claims).to.have.members(['sto:*']);
    });

    it('should overwrite with * in the middle', () => {
      const perms = ShiroPerms.from([
        'sto:viw',
        'sto:adm:1234',
        'sto:adm:4231',
        'sto:viw:4231',
        'sto:edt:4231'
      ]);

      perms.add('sto:*:4231');

      expect(perms.claims).to.have.members(['sto:viw:*', 'sto:adm:1234:*', 'sto:*:4231:*']);
    });
  });

  describe('discards tests', () => {
    it('should discard with * at the end', () => {
      const perms = ShiroPerms.from('sto');

      perms.add(['sto:viw', 'sto:edt', 'sto:adm:1234']);

      expect(perms.claims).to.have.members(['sto:*']);
    });

    it('should discard with * in the middle', () => {
      const perms = ShiroPerms.from('sto:*:1234');

      perms.add(['sto:viw:1234', 'sto:edt:1234', 'sto:adm:1234']);

      expect(perms.claims).to.have.members(['sto:*:1234:*']);
    });

    it('should not discard if other resource', () => {
      const perms = ShiroPerms.from('sto:*:1234');

      perms.add('sto:viw:4321');

      expect(perms.claims).to.have.members(['sto:*:1234:*', 'sto:viw:4321:*']);
    });
  });
});
