fx_version 'cerulean'
game 'gta5'
lua54 'yes'
author 'xSziro'

shared_script {
    '@ox_lib/init.lua',
    'config.lua'
}

client_script {
    'client/client.lua',

}

ui_page 'web/ui.html'
files {
    'web/ui.html',
    'web/styles.css',
    'web/js.js',
    'web/*',
    'locales/**',
}
export 'getColor'
dependency {
    'ox_fuel',
    'ox_lib',
    'esx_status'
}