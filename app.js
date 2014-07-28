var ACS = require('acs').ACS,
    logger = require('acs').logger,
    express = require('express');

// initialize app
function start(app, express) {
	ACS.init('HxZ9fykTxyYoc9o6Y28fbdZkoQrkmpAc', 'ACS_OAUTH_SECRET_PRODUCTION');
	logger.setLevel('DEBUG');
	
	//use connect.session
	app.use(express.cookieParser());
	app.use(express.session({ key: 'node.acs', secret: "my secret" }));
  
  	//set favicon
	app.use(express.favicon(__dirname + '/public/images/icon.png'));
	
	//Request body parsing middleware supporting JSON, urlencoded, and multipart
    app.use(express.bodyParser());
}

// release resources
function stop() {
	
}