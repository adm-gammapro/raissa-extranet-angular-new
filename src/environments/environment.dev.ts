const URL_BASE = 'http://localhost:8082'

export const environment = {
    production: false,
    url: {
        base: URL_BASE,
        baseApi: `${URL_BASE}/api`,
        requestNewPassword: `${URL_BASE}/api/public/login/requestNewPassword`,
        changePassword: `${URL_BASE}/api/public/login/changePassword`
    },
    session: {
        ACCESS_TOKEN : 'access_token',
        REFRESH_TOKEN : 'refresh_token',
        CODE_VERIFIER : 'code_verifier',
        USERNAME : 'username',
        ID_USUARIO_SESSION : 'id_usuario_session',
        NOMBRES_USUARIO : 'nombres_usuarios',
        ID_EMPRESA : 'identifyEnterprise',
        NOMBRE_EMPRESA : 'nameEnterprise',
        MENU_ITEMS: 'menuItems'
    },
    security: {
        authorize_uri: 'http://localhost:9000/oauth2/authorize?',
        client_id: 'user',
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
