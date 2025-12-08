const { findWithPasswordByUsername } = require('../users/users.repository');

async function getUserWithPasswordByUsername(username) {
    return findWithPasswordByUsername(username);
}

module.exports = {
    getUserWithPasswordByUsername,
};
