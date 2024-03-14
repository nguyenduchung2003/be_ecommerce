import admin from "firebase-admin"
admin.initializeApp({
     credential: admin.credential.cert({
          type: process.env.Type,
          project_id: process.env.ProjectId,
          private_key_id: process.env.PrivateKeyId,
          private_key: process.env.PrivateKey,
          client_email: process.env.ClientEmail,
          client_id: process.env.ClientId,
          auth_uri: process.env.AuthUri,
          token_uri: process.env.TokenUri,
          auth_provider_x509_cert_url: process.env.AuthProviderX509CertUrl,
          client_x509_cert_url: process.env.ClientX509CertUrl,
          universe_domain: process.env.UniverseDomain,
     }),
     storageBucket: process.env.StorageBucket,
})
export default admin
