(function () {
    'use strict';

    const momentTZ = require('moment-timezone');

    const _this = {
        isNull: isNull,
        FormatCurrency: FormatCurrency,
        FormatPercent: FormatPercent,
        FormatDate: FormatDate,
        FormatDateNoTime: FormatDateNoTime,
        IsBetween5pmAnd8Am: IsBetween5pmAnd8Am,
        StorageName2DisplayName: StorageName2DisplayName,
        FormatList: FormatList,
        ToE164: ToE164,
        PromiseAll: PromiseAll,
        PromiseRemainingTime: PromiseRemainingTime,
    };
    module.exports = _this;

    /**
     * Checks if a variable is null or undefined
     * @param arg
     * @return {boolean}
     */
    function isNull(arg) {
        return arg === null || arg === undefined;
    }

    /**
     * Formats a number as currency
     * @param {number} value the number to be formatted
     * as currency – ex. $1,234.56
     * @return {string} Formatted Value
     */
    function FormatCurrency(value) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        });
        return formatter.format(value);
    }

    /**
     *
     * @param value the number to convert
     * @returns a string in percentage format
     */
    function FormatPercent(value) {
        const formatter = new Intl.NumberFormat('en-Us', {
            style: 'percent',
        });
        return formatter.format(value);
    }

    /**
     * Formats a date based on input
     * @param value
     * @return {*}
     */
    function FormatDate(value) {
        return new momentTZ(value).tz('America/Chicago').format('MMM DD, YYYY · hh:mm A');
    }

    function FormatDateNoTime(time) {
        return new momentTZ(time).tz('America/Chicago').format('MMM DD, YYYY');
    }

    /**
     * Checks if a given timezone is currently between 5 pm and 8 am
     * @param timezone
     * @return {boolean} true if it is between 5 pm and 8 pm
     */
    function IsBetween5pmAnd8Am(timezone) {
        const currentTime = momentTZ().tz(timezone);

        // Check if between 00:00:00 and 07:59:59
        if (
            currentTime.isBetween(
                momentTZ(currentTime).tz(timezone).startOf('day'),
                momentTZ(currentTime).tz(timezone).startOf('day').add(8, 'hours'),
                null,
                '[)'
            )
        )
            return true;

        // Check if between 16:59:59 and 23:59:59
        if (
            currentTime.isBetween(
                momentTZ(currentTime).tz(timezone).endOf('day').subtract(7, 'hours'),
                momentTZ(currentTime).tz(timezone).endOf('day'),
                null,
                '(]'
            )
        )
            return true;

        return false;
    }

    /**
     * Converts a string from camel case to title case, replacing parts of the form
     * word-word with Word / Word
     * @param str the string to convert
     * @return {string} Camel case string converted to title case
     */
    function StorageName2DisplayName(str) {
        if (!str) return '';

        const result = str
            .replace(/([A-Z])/g, ' $1') // Puts a space before each capital letter: 'homePainter' => 'home Painter'
            .replace(/(-)([a-z])/g, ' / $2') // Replaces a dash with a slash: 'home-painter' => 'home / painter'
            .replace(/ [a-z]/g, ($0) => $0.replace($0, $0.toUpperCase())); // Capitalizes the first letter of each word that follows a space
        return result.charAt(0).toUpperCase() + result.slice(1); // capitalizes the first letter of the first word
    }

    function FormatList(arr) {
        let str = '';

        for (let i = 0; i < arr.length; i++) {
            str += _this.StorageName2DisplayName(arr[i]);
            if (i !== arr.length - 1) {
                str += ', ';
            }
        }

        return str;
    }

    /**
     * Attempts to convert a phone number to E164 format
     * @param number
     * @return {string} A
     */
    function ToE164(number) {
        const numbers = [];
        for (let i = 0; i < number.length; ++i) {
            if (/^[0-9]+$/.test(number.charAt(i))) {
                numbers.push(number.charAt(i));
            }
        }
        const pre = numbers.length === 11 ? ['+'] : ['+1'];
        return pre.concat(numbers).join('');
    }

    /**
     * Wrapper function to Promise.all so you can call await on it without it throwing an error without catch
     * @param promises array of promises
     * @returns {Promise<any>}
     */
    function PromiseAll(promises) {
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(resolve).catch(reject);
        });
    }

    /**
     * Returns a promise that will resolve at start + duration
     * @param start date in milliseconds from the start of the request
     * @param start the start time of the api
     * @param duration the amount of time the api should take
     */
    function PromiseRemainingTime(start, duration) {
        return new Promise((resolve) => {
            const now = new Date().getTime();
            const end = start + duration;
            now < end ? setTimeout(resolve, end - now) : resolve();
        });
    }
})();
