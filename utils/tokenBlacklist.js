// Token Blacklist Utility
// This handles logout by blacklisting JWT tokens

class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  // Add token to blacklist
  addToBlacklist(token) {
    this.blacklistedTokens.add(token);
    console.log(`Token blacklisted: ${token.substring(0, 20)}...`);
  }

  // Check if token is blacklisted
  isBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  // Remove token from blacklist (if needed)
  removeFromBlacklist(token) {
    this.blacklistedTokens.delete(token);
  }

  // Get blacklist size
  getBlacklistSize() {
    return this.blacklistedTokens.size;
  }

  // Cleanup expired tokens (optional - for memory management)
  startCleanup() {
    // Cleanup every hour
    this.cleanupInterval = setInterval(() => {
      const beforeSize = this.blacklistedTokens.size;
      // In a production environment, you might want to store tokens with expiry
      // and remove them automatically
      console.log(`Blacklist cleanup: ${beforeSize} tokens`);
    }, 60 * 60 * 1000); // 1 hour
  }

  // Stop cleanup
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Clear all blacklisted tokens
  clearAll() {
    this.blacklistedTokens.clear();
    console.log('All tokens cleared from blacklist');
  }
}

// Create singleton instance
const tokenBlacklist = new TokenBlacklist();

module.exports = tokenBlacklist;
