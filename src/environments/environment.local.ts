const URL_BASE = 'http://localhost:8082'

export const environment = {
  production: false,
  url: {
    base: URL_BASE,
    baseApi: `${URL_BASE}/api`,
    landing: 'http://127.0.0.4:4200',
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
    authorize_uri: 'http://localhost:9000/oauth2/authorize?',
    client_id: 'client_extranet',
    secret_client: 'S3cr3t$$',
    redirect_uri: 'http://127.0.0.1:4200/authorized',
    scope: 'openid',
    response_type: 'code',
    response_mode: 'form_post',
    code_challenge_method: 'S256',
    token_url: "http://localhost:9000/oauth2/token",
    grant_type: "authorization_code",
    resource_url: 'http://localhost:8082/resource/',//esta es la ruta del servicio del server resource
    logout_url: 'http://localhost:9000/logout',
    secret_pkce: 'secret',
  }
};
