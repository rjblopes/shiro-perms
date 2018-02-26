const { expect } = require('chai');
const ShiroPerms = require('../index');

const perms = new ShiroPerms();

describe('Testing ShiroPerms', () => {
  describe('testing empty perms', () => {
    it('*', () => expect(perms.check('*')).to.equal(false));
    it('store', () => expect(perms.check('store')).to.equal(false));
    it('store:*', () => expect(perms.check('store:*')).to.equal(false));
    it('store:view', () => expect(perms.check('store:view')).to.equal(false));
    it('store:*:1234', () => expect(perms.check('store:*:1234')).to.equal(false));
  });


  describe('testing perms', () => {
    before(() => {
      perms.add([
        'user:*',
        'store:view',
        'store:*:1234',
        'store:admin:4321',
        'place:*:11123'
      ]);
      //perms.add(['user:edit']);
    });

    describe('testing explictit perms', () => {
      it('user:*', () => expect(perms.check('user:*')).to.equal(true));
      it('store:view', () => expect(perms.check('store:view')).to.equal(true));
      it('store:*:1234', () => expect(perms.check('store:*:1234')).to.equal(true));
      it('store:admin:4321', () => expect(perms.check('store:admin:4321')).to.equal(true));
      it('store:admin:1122', () => expect(perms.check('store:admin:1122')).to.equal(false));
      it('other:*', () => expect(perms.check('other:*')).to.equal(false));
    });

    describe('testing *', () => {
      it('*', () => expect(perms.check('*')).to.equal(false));
      it('user:*:1123', () => expect(perms.check('user:*')).to.equal(true));
      it('user:edit', () => expect(perms.check('user:edit')).to.equal(true));
      it('user:edit:1111', () => expect(perms.check('user:edit:1111')).to.equal(true));
      it('user:some:*', () => expect(perms.check('user:some:*')).to.equal(true));
      it('store', () => { debugger; expect(perms.check('store')).to.equal(true); }); // true
      it('store:*', () => { debugger; expect(perms.check('store:*')).to.equal(true); });
      it('store:edit:1234', () => expect(perms.check('store:edit:1234')).to.equal(true));
    });

    describe('testing implicit *', () => {
      it('user', () => expect(perms.check('user')).to.equal(true));
      it('store:view:*', () => expect(perms.check('store:view:*')).to.equal(true));
      it('store:view:1122', () => expect(perms.check('store:view:1122')).to.equal(true));
      it('store:admin:*', () => { debugger; expect(perms.check('store:admin:*')).to.equal(false); }); // true
      it('store:admin', () => { debugger; expect(perms.check('store:admin')).to.equal(true) }); // true
    });
  });
});
