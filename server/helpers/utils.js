module.exports = {
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  validatePassword: password => {
    if (!password || password.length <= 5) {
      return {
        valid: false,
        message: "Password must be > 5 characters"
      };
    }
    return { valid: true };
  }
};
