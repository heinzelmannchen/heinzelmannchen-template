var should = require("should")
describe('Test Travis', function() {
    describe('ShouldJs', function() {
        it('true should be true', function() {
            (true).should.be.true;
        })
        it('true should be true', function() {
            (1).should.be.a.Number;
        })
    })
})
