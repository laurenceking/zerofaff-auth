const doFetch = (url, data) =>
  fetch(url, {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  })
    .then(response => response.json())
    .catch(err => {
      console.error(err);
    });

export const activate = async token => await doFetch("/activate", { token });

export const resendActivation = async nameoremail =>
  await doFetch("/activate/resend", { nameoremail });

export const recover = async nameOrEmail =>
  await doFetch("/recover/send", { nameOrEmail });

export const changePassword = async data =>
  await doFetch("/change/password", data);

export const reset = async (password, token) =>
  await doFetch("/recover", { password, token });

export const checkEmail = async email =>
  await doFetch("/check/email", { usernameOrEmail: email });

export const checkUsername = async username =>
  await doFetch("/check/username", { usernameOrEmail: username });

export const signUp = async data => await doFetch("/signup", data);

export const login = async data => await doFetch("/login", data);
