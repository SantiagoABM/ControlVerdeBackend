const activeTokens = new Map(); 
// Structure: userId -> { token, expiresAt }

function saveToken(userId, token, expiresAt) {
  activeTokens.set(userId, { token, expiresAt });
}

function getUserToken(userId) {
  return activeTokens.get(userId);
}

function invalidateToken(userId) {
  activeTokens.delete(userId);
}

module.exports = {
  saveToken,
  getUserToken,
  invalidateToken
};
