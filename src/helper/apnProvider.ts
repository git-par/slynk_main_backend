import apn from "apn";

export const apnProvider = () =>
  new apn.Provider({
    cert: process.env.APPLE_CERT_PATH,
    key: process.env.APPLE_KEY_PATH,
    pfx: process.env.APPLE_PFX_PATH,
    passphrase: process.env.APPLE_CERT,
    production: true,
  });
