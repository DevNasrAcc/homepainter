(function() {
    'use strict';
    const constants = require('../../src/config/constants');
    const sinon = require('sinon');
    require('chai').should();

    describe('Fallthrough Controller Tests', function() {
        describe('CatchAll', function() {
            const fallthroughController = require('../../src/controller/fallthroughController');

            it('should return method not allowed', () => {
                let res = {
                    send: function() {},
                    status: function() {
                        return this;
                    }
                };

                let req = sinon.spy();
                let resSendSpy = sinon.spy(res, 'send');
                let resStatusSpy = sinon.spy(res, 'status');

                fallthroughController.CatchAll(req, res);
                req.notCalled.should.be.true;
                resStatusSpy.withArgs(constants._4xx._405.status).calledOnce.should.be.true;
                resSendSpy.withArgs(constants._4xx._405.reason).calledOnce.should.be.true;
            });
        });
    });
})();
