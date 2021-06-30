(function () {
    'use strict';
    const expect = require('chai').expect;
    require('chai').should();
    const sinon = require('sinon');

    describe('Helpers Test', function () {
        const helper = require('../../src/helpers/helpers');
        const constants = require('../../src/config/constants');

        describe('IsNull unit tests', function () {
            let arg;

            it('should return true on null', () => {
                arg = null;
                expect(helper.isNull(arg)).to.be.true;
            });

            it('should return true on undefined', () => {
                arg = undefined;
                expect(helper.isNull(arg)).to.be.true;
            });

            it('should return true on no args', () => {
                expect(helper.isNull()).to.be.true;
            });

            it('should return false', () => {
                arg = 'str';
                expect(helper.isNull(arg)).to.be.false;
            });
        });

        describe('FormatCurrency Unit Tests', function () {
            it('should return a properly formmatted string', () => {
                expect(helper.FormatCurrency(10.958682)).to.equal('$10.96');
                expect(helper.FormatCurrency(0.55)).to.equal('$0.55');
                expect(helper.FormatCurrency(12)).to.equal('$12.00');
            });

            it('should return with NaN of a number is not inserted', function () {
                expect(isNaN(helper.FormatCurrency('asdign'))).to.equal(true);
            });
        });

        describe('FormatPercent', function () {
            it('should return a properly formatted a percent', () => {
                expect(helper.FormatPercent(0.25)).to.equal('25%');
            });
        });

        describe('FormatDate', function () {
            it('should return a properly formatted string date', () => {
                expect(helper.FormatDate('2020-01-20T17:43:08.918Z')).to.equal('Jan 20, 2020 · 11:43 AM');
            });
            it('should return a properly formatted date', () => {
                const date = new Date('2020-01-20T17:43:08.918Z');
                expect(helper.FormatDate(date)).to.equal('Jan 20, 2020 · 11:43 AM');
            });
        });

        describe('FormatDateNoTime', function () {
            it('should return a properly formatted string date', () => {
                expect(helper.FormatDateNoTime('2020-01-20T17:43:08.918Z')).to.equal('Jan 20, 2020');
            });
            it('should return a properly formatted date', () => {
                const date = new Date('2020-01-20T17:43:08.918Z');
                expect(helper.FormatDateNoTime(date)).to.equal('Jan 20, 2020');
            });
        });

        describe('IsBetween5pmAnd8am Test', function () {
            let consoleStub;
            const moment = require('moment');

            before(() => {
                // the tests complain about using 'foo' as a timezone. so we just mock out the caller to ignore it
                consoleStub = sinon.stub(console, 'error');
            });

            after(() => {
                consoleStub.restore();
            });

            it('should return true for anytime between 5pm and 8 am', () => {
                let mockCurrTime = new moment().startOf('day').add(17, 'hours');
                let clock;

                // 15 hours between 5pm and 8am
                for (let i = 0; i < 15; i++) {
                    clock = sinon.useFakeTimers(mockCurrTime.valueOf());
                    expect(helper.IsBetween5pmAnd8Am('foo')).to.equal(true);
                    clock.restore();
                    mockCurrTime.add(1, 'hours');
                }
            });

            it('should return false for 08:00:00', () => {
                let mockCurrTime = new moment().startOf('day').add(8, 'hours');
                let clock = sinon.useFakeTimers(mockCurrTime.valueOf());
                expect(helper.IsBetween5pmAnd8Am('foo')).to.equal(false);
                clock.restore();
            });

            it('should return false for 16:59:59', () => {
                let mockCurrTime = new moment().endOf('day').subtract(7, 'hours');
                let clock = sinon.useFakeTimers(mockCurrTime.valueOf());
                expect(helper.IsBetween5pmAnd8Am('foo')).to.equal(false);
                clock.restore();
            });

            it('should return false for all others', () => {
                let mockCurrTime = new moment().startOf('day').add(8, 'hours');
                let clock;

                // 15 hours between 8am and 5pm
                for (let i = 0; i < 9; i++) {
                    clock = sinon.useFakeTimers(mockCurrTime.valueOf());
                    expect(helper.IsBetween5pmAnd8Am('foo')).to.equal(false);
                    clock.restore();
                    mockCurrTime.add(1, 'hours');
                }
            });
        });

        describe('StorageName2DisplayName Test', function () {
            it('should return a properly formatted string', () => {
                expect(helper.StorageName2DisplayName('')).to.equal('');
                expect(helper.StorageName2DisplayName('camelCase')).to.equal('Camel Case');
                expect(helper.StorageName2DisplayName('camel')).to.equal('Camel');
                expect(helper.StorageName2DisplayName('camelCaseWithManyMore')).to.equal('Camel Case With Many More');
                expect(helper.StorageName2DisplayName('deck-deckStaining')).to.equal('Deck / Deck Staining');
            });
        });

        describe('FormatList Test', function () {
            let StorageName2DisplayNameStub;

            beforeEach(() => {
                StorageName2DisplayNameStub = sinon.stub(helper, 'StorageName2DisplayName').returns('Asdf');
            });

            afterEach(() => {
                StorageName2DisplayNameStub.restore();
            });

            it('should return a properly formatted list', () => {
                let arr = ['asdf', 'asdf', 'asdf'];

                const ret = helper.FormatList(arr);

                ret.should.equal('Asdf, Asdf, Asdf');
                StorageName2DisplayNameStub.callCount.should.equal(3);
            });

            it('should return a single item', () => {
                let arr = ['asdf'];

                const ret = helper.FormatList(arr);

                ret.should.equal('Asdf');
                StorageName2DisplayNameStub.calledOnce.should.be.true;
            });

            it('should return an empty string', () => {
                let arr = [];

                const ret = helper.FormatList(arr);

                ret.should.equal('');
                StorageName2DisplayNameStub.called.should.be.false;
            });
        });

        describe('ToE164 Test', function () {
            it('should return an E164 formatted number', () => {
                const numbers = [
                    '+15157058449',
                    '+1 (515) 705-8449',
                    '+1 (515)-705-8449',
                    '+1515-705-8449',
                    '+1 515-705-8449',
                    '+1 515 705 8449',
                    '515 705 8449',
                    '515 705-8449',
                    '515-705-8449',
                    '(515) 705 8449',
                    '(515) 705-8449',
                    '5157058449',
                ];

                for (let i = 0; i < numbers.length; ++i) {
                    const formatted = helper.ToE164(numbers[i]);
                    expect(formatted).to.equal('+15157058449');
                }
            });
        });

        describe('PromiseAll Test', function () {
            it('should resolve gracefully', async () => {
                const success = 'success';
                const promise = new Promise((resolve) => setTimeout(() => resolve(success), 50));

                const response = await helper.PromiseAll([promise]);

                expect(response).to.deep.equal([success]);
            });

            it('should reject gracefully', async () => {
                const error = 'error';
                const promise = new Promise((resolve, reject) => setTimeout(() => reject(error), 50));

                try {
                    await helper.PromiseAll([promise]);
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    expect(e).to.equal(error);
                }
            });
        });

        describe('PromiseRemainingTime', function () {
            let start, clock;

            beforeEach(() => {
                start = new Date();
                clock = sinon.useFakeTimers(start);
            });

            afterEach(() => {
                clock.restore();
            });

            it('should wait until end time', (done) => {
                helper.PromiseRemainingTime(start.getTime(), 50).then(done);
                clock.tick(50);
            });

            it('should resolve if the time has already passed on dev', (done) => {
                clock.tick(51);
                helper.PromiseRemainingTime(start.getTime(), 50).then(done);
            });
        });
    });
})();
