const bcrypt = require("bcrypt")

const hashPasswordSync = (plainPasswd) => {
    return bcrypt.hashSync(plainPasswd, 10);
};

const comparePassword = (plainPasswd, hashPasswd) => {
    return bcrypt.compareSync(plainPasswd, hashPasswd)
};


exports.hashPasswordSync = hashPasswordSync;
exports.comparePassword = comparePassword;