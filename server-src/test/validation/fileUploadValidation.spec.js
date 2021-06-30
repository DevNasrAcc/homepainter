(function () {
    'use strict';

    const sinon = require('sinon');
    const chai = require('chai');
    require('chai').should();
    const expect = chai.expect;

    describe('FileUploadValidation Test', function () {
        const constants = require('../../src/config/constants');
        const fileUploadValidation = require('../../src/validation/fileUploadValidation');

        describe('ValidateProductImages', () => {
            let req;

            beforeEach(() => {
                req = {
                    files: {
                        'img4.png': {
                            name: 'img4.png',
                            mimetype: 'image/png',
                        },
                    },
                };
            });

            it('should successfully validate', () => {
                const failures = fileUploadValidation.ValidatePhoto(req);
                failures.should.deep.equal([]);
            });

            it('should return an error if undefined', () => {
                const failures = fileUploadValidation.ValidatePhoto(undefined);
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 0.`]);
            });

            it('should return an error if obj has no keys', () => {
                const failures = fileUploadValidation.ValidatePhoto({});
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 0.`]);
            });

            it('should return an error if obj has two keys', () => {
                req.files['foobar'] = JSON.parse(JSON.stringify(req.files['img4.png']));
                const failures = fileUploadValidation.ValidatePhoto(req);
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 2.`]);
            });

            it("should return an error if obj doesn't have a correct mimetype", () => {
                req.files['img4.png'].mimetype = 'foobar';
                const failures = fileUploadValidation.ValidatePhoto(req);
                failures.should.deep.equal([
                    `File [foobar] is not a valid mimetype from [${[
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/bmp',
                        'image/tiff',
                    ].toString()}]`,
                ]);
            });
        });

        describe('ValidatePdfFiles Test', () => {
            let req;

            beforeEach(() => {
                req = {
                    files: {
                        'file1.pdf': {
                            name: 'file1.pdf',
                            mimetype: 'application/pdf',
                        },
                    },
                };
            });

            it('should successfully validate', () => {
                const failures = fileUploadValidation.ValidateInsurance(req);
                failures.should.deep.equal([]);
            });

            it('should return an error if undefined', () => {
                const failures = fileUploadValidation.ValidateInsurance(undefined);
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 0.`]);
            });

            it('should return an error if obj has no keys', () => {
                const failures = fileUploadValidation.ValidateInsurance({});
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 0.`]);
            });

            it('should return an error if obj has two keys', () => {
                req.files['foobar'] = JSON.parse(JSON.stringify(req.files['file1.pdf']));
                const failures = fileUploadValidation.ValidateInsurance(req);
                failures.should.deep.equal([`expected req.files to be of length 1, but found length 2.`]);
            });

            it("should return an error if obj doesn't have a correct pdf mimetype", () => {
                req.files['file1.pdf'].mimetype = 'foobar';
                const failures = fileUploadValidation.ValidateInsurance(req);
                failures.should.deep.equal([
                    `File [foobar] is not a valid mimetype from [${['application/pdf'].toString()}]`,
                ]);
            });
        });
    });
})();
