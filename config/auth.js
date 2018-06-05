module.exports = {

    'googleAuth' : {
        'clientID'      : '197999679029-0o911bog5lapuna69quvvh4rkc8crght.apps.googleusercontent.com', // your App ID
        'clientSecret'  : '8qbKB59CdpkKQmoUYBLHY1vx', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    },

    'facebookAuth' : {
        'clientID'      : '644077089273017',
        'clientSecret'  : '8a1398ae53e6c6a09524198937a596e4',
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    }

};
