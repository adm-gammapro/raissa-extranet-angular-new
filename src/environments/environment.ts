const URL_BASE = 'https://www.raissaob.com/api/extranet'

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
        authorize_uri: 'https://www.raissaob.com/api/autorizador/oauth2/authorize?',
        client_id: 'extranet',
        redirect_uri: 'https://www.raissaob.com/extranet/authorized',
        scope: 'openid',
        response_type: 'code',
        response_mode: 'form_post',
        code_challenge_method: 'S256',
        token_url: "https://www.raissaob.com/api/autorizador/oauth2/token",
        grant_type: "authorization_code",
        resource_url: 'https://www.raissaob.com/api/extranet/resource/',//esta es la ruta del servicio del server resource
        logout_url: 'https://www.raissaob.com/api/autorizador/logout',
        secret_pkce: 'extranet',
    }
};