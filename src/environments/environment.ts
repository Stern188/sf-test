// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    // SERVER_URL: `.`,
    SERVER_URL: `http://192.168.18.180:9665/api/v1`,
    Login_url: `http://192.168.18.180:9665/auth/tokenauth`,
    refresh_url: `http://192.168.18.180:9665/auth/tokenrefresh`,
    production: true,
    hmr: false,
    useHash: true
};
