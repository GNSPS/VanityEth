const crypto = require('crypto');
var ethUtils = require('ethereumjs-util');
var ERRORS = {
    invalidHex: "Invalid hex input"
}
var getRandomWallet = function() {
    var randbytes = crypto.randomBytes(32);
    var address = '0x' + ethUtils.privateToAddress(randbytes).toString('hex');
    return { address: address, privKey: '0x' + randbytes.toString('hex') }
}
var isValidHex = function(hex) {
    if (!hex.length) return true;
    hex = hex.toUpperCase();
    var re = /^[0-9A-F]+$/g;
    return re.test(hex);
}
var isValidVanityWallet = function(wallet, input, isChecksum, isContract) {
    var _add = wallet.address;
    if (isContract) {
        var _contractAdd = getDeteministicContractAddress(_add);
        _contractAdd = isChecksum ? ethUtils.toChecksumAddress(_contractAdd) : _contractAdd;
        return _contractAdd.substr(2, input.length) == input
    }
    _add = isChecksum ? ethUtils.toChecksumAddress(_add) : _add;
    return _add.substr(2, input.length) == input;
}
var getVanityWallet = function(input = '', isChecksum = false, isContract = false) {
    if (!isValidHex(input)) throw new Error(ERRORS.invalidHex);
    input = isChecksum ? input : input.toLowerCase();
    var _wallet = getRandomWallet();
    while (!isValidVanityWallet(_wallet, input, isChecksum, isContract)) _wallet = getRandomWallet(isChecksum);
    if (isChecksum) _wallet.address = ethUtils.toChecksumAddress(_wallet.address);
    return _wallet;
}
var getDeteministicContractAddress = function(address) {
    return '0x' + ethUtils.sha3(ethUtils.rlp.encode([address, 0])).slice(12).toString('hex');
}
module.exports = {
    getVanityWallet: getVanityWallet,
    isValidHex: isValidHex,
    ERRORS: ERRORS
}