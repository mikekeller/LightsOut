/**
 * Utils -- A JavaScript utility library
 * permits users to guess next moves if they desire.
 *
 * MIT License:
 * Copyright (C) 2014 Michael Keller.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var utils = (function () {

    /**
     * Enables and disables buttons
     * One call can enable or disable an arbitrary number of buttons.
     * The function is recursive calling itself once for each button passed in after the first.
     * @param state "enable" enables the buttons and state "disable" disables the buttons
     * @param ary an array of buttons to process
     */
    function setButtonState(state, ary) {
        'use strict';
        var btnName;

        if (ary.length === 0) {
            return;
        }
        btnName = ary.shift();
        if (state === "disable") {
            $('#' + btnName).
                removeClass('buttonOn').
                addClass('buttonOff').
                attr("disabled", true);
        } else if (state === "enable") {
            $('#' + btnName).
                removeClass('buttonOff').
                addClass('buttonOn').
                removeAttr('disabled');
        }
        // recursive call get next button
        setButtonState(state, ary);
    }

    /**
     * Returns a string of two digits eg 19, 03
     * @param val
     * @returns {*}
     */
    function pad(val) {
        "use strict";
        return val > 9 ? val : "0" + val;
    }

    return {
        setButtonState: setButtonState,
        pad           : pad
    }

})();
