import { boot } from 'quasar/wrappers';
import vue3GoogleLogin from 'vue3-google-login';

export default boot(({ app }) => {
  app.use(vue3GoogleLogin, {
    clientId: '809926945056-1b947ntlssiugiu0uuofj73j6v3eni7e.apps.googleusercontent.com'
  });
});
