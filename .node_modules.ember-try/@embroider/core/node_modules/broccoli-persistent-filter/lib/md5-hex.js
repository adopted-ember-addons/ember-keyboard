/// @ts-check
'use strict';
const crypto = require("crypto");
function md5sum(input) {
    let hash = crypto.createHash('md5');
    /**
     * @param buf {}
     */
    function update(buf) {
        if (typeof buf === 'string') {
            hash.update(buf, 'utf8');
        }
        else {
            hash.update(buf);
        }
    }
    if (arguments.length > 1) {
        throw new Error('Too many arguments. Try specifying an array.');
    }
    if (Array.isArray(input)) {
        input.forEach(update);
    }
    else {
        update(input);
    }
    return hash.digest('hex');
}
module.exports = md5sum;
//# sourceMappingURL=md5-hex.js.map