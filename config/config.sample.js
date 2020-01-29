module.exports = {
  api: {
    host: "localhost",
    port: "3002"
  },
  db: {
    host: "localhost",
    username: "username",
    password: "password",
    database: "database_name",
    timezone: "UTC"
  },
  emailContent: {
    from: "Auth <no-reply@localhost:3002>",
    activate: {
      subject: "Activate account",
      html: (token) => `<h1>Account activation</h1><p>You have signed up for an account, please <a href="https://localhost:3002?token=${token}">click here to activate</a></p><p>If you did not sign up then please ignore this email or <a href="https://localhost:3002?remove=${token}">click here to let us know</a></p>`,
      text: (token) => `Account activation: Please go to https://localhost:3002?token=${token} to activate your account. If you did not sign up then please ignore this email or go here to https://localhost:3002?remove=${token} to let us know`
    },
    recover: {
      subject: "Recover account",
      html: (token) => `<h1>Account recovery</h1><p>If you did not request account recovery please ignore this email. Otherwise please <a href="https://localhost:3002?recover=${token}">click here to set a new password</a></p>`,
      text: (token) => `Account recovery: If you did not request account recovery please ignore this email. Otherwise please go to https://localhost:3002?recover=${token} to set a new password</a></p>`
    }
  },
  site: {
    login_url: "http://localhost:5001",
    title: "Authentication" 
  },
  token: {
    algorithm: "RS256",
    issuer: "auth",
    ttl: 86400
  }
}