const URL_BASE = 'https://www.raissaob.com/api/extranet'

export const environment = {
  production: true,
  url: {
    base: URL_BASE,
    baseApi: `${URL_BASE}/api`,
    requestNewPassword: `${URL_BASE}/api/public/login/requestNewPassword`,
    changePassword: `${URL_BASE}/api/public/login/changePassword`
  },
  session: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    CODE_VERIFIER: 'code_verifier',
    USERNAME: 'username',
    ID_USUARIO_SESSION: 'id_usuario_session',
    NOMBRES_USUARIO: 'nombres_usuarios',
    ID_EMPRESA: 'identifyEnterprise',
    NOMBRE_EMPRESA: 'nameEnterprise',
    CLASE_USUARIO_SESSION: 'clase_usuario_session',
    APELLIDO_PATERNO_USUARIO_SESSION: 'apellido_paterno_usuario_session',
    APELLIDO_MATERNO_USUARIO_SESSION: 'apellido_materno_usuario_session',
    CORREO_USUARIO_SESSION: 'correo_usuario_session',
    TELEFONO_USUARIO_SESSION: 'telefono_usuario_session',
    MENU_ITEMS: 'menuItems'
  },
  security: {
    authorize_uri: 'https://www.raissaob.com/api/autorizador/oauth2/authorize?',
    client_id: 'extranet',
    secret_client: 'S3cr3t$$',
    redirect_uri: 'https://www.raissaob.com/extranet/authorized',
    scope: 'openid',
    response_type: 'code',
    response_mode: 'form_post',
    code_challenge_method: 'S256',
    token_url: "https://www.raissaob.com/api/autorizador/oauth2/token",
    grant_type: "authorization_code",
    resource_url: 'https://www.raissaob.com/api/extranet/resource/',//esta es la ruta del servicio del server resource
    logout_url: 'https://www.raissaob.com/api/autorizador/logout',
    secret_pkce: 'secret',
  }
};
