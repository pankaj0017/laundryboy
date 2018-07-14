module.exports = {

    'googleAuth' : {
        'clientID'      : '582274529113-f5r0g68n6drl12duleta1jdccp6sjm9j.apps.googleusercontent.com', // your App ID
        'clientSecret'  : 'MX9KqIfheIwDJ6uiePNNrV04', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    },

    'facebookAuth' : {
        'clientID'      : '1733790833364047',
        'clientSecret'  : '4bf7ef221bae588aa997b08a28fc5b54',
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    }

};
