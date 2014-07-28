var ACS = require('acs').ACS, 
	logger = require('acs').logger, 
	RSS = require('rss');

function index(req, res) {
	res.render('index', {
		title : 'Toddler play'
	});

	// ACS.Posts.query({
	// where:null,
	// order:'-updated_at',
	// page:1,
	// per_page:10
	// }, function(data){
	// res.send(data);
	// });
}

var postsHelper = {
	postTypes : {
		discussion : 'discussions',
		checkin : 'checkins',
		group : 'groups_join',
		actions_add : 'actions_add',
		lists_add : 'lists_add',
		joins : 'joins'
	},
	intents : {
		checkin : 'do',
		want : 'want',
		talk : 'talk',
		plan : 'plan'
	},
	getUserDisplayName : function(_user) {
		var _name = '';
		if (_user) {
			if (_user.custom_fields && _user.custom_fields.display_name) {
				_name = _user.custom_fields.display_name;
			} else if (_user.username) {
				_name = _user.username.split('!#!user!#!')[0];
			}
		}
		return _name;
	},
	titleize : function(str) {
		return ('' + str).replace(/(?:^|\s)\S/g, function(ch) {
			return ch.toUpperCase();
		})
	},
	convertToRssItem : function(_item) {
		
		var user_name = '', user_image = null, intent_text = '', post_intent_text = '', activity_name = '', activity_image = null;
		if (_item.user) {
			user_name = postsHelper.getUserDisplayName(_item.user);

			if (_item.user.photo && _item.user.photo.urls && _item.user.photo.urls.square_75) {
				user_image = _item.user.photo.urls.square_75;
			} else if (_item.custom_fields && _item.custom_fields.fb_user_id) {
				user_image = 'https://graph.facebook.com/' + _item.custom_fields.fb_user_id + '/picture';
			}
		}

		if (_item.event) {
			activity_name = _item.event.name;

			if (_item.event.photo && _item.event.photo.urls && _item.event.photo.urls.square_75) {
				activity_image = _item.event.photo.urls.square_75;
			}
		}

		if (_item.title === postsHelper.postTypes.checkin) {
			intent_text = 'checked in to';

			var intent_type = postsHelper.intents.checkin;
			if (_item.custom_fields && _item.custom_fields.intent) {
				intent_type = _item.custom_fields.intent;
			}
			if (_item.custom_fields && _item.custom_fields.upcoming_date_start) {
				intent_type = postsHelper.intents.plan;
			}

			switch(intent_type) {
				case postsHelper.intents.want :
					intent_text = 'wanted';
					break;
				case postsHelper.intents.talk :
					intent_text = 'talked about';
					break;
				case postsHelper.intents.plan :
					intent_text = 'planned';
					break;
				default:
					intent_text = 'checked in to';
					break;
			}
		} else if (_item.title === postsHelper.postTypes.joins) {
			if (_item.custom_fields && _item.custom_fields.original_poster) {
				intent_text = ' joined ' + postsHelper.getUserDisplayName(_item.custom_fields.original_poster) + ' in';
			} else {
				intent_text = 'joining';
			}
		} else if (_item.title === postsHelper.postTypes.actions_add) {
			intent_text = 'favored';
			//post_intent_text = 'to Favorites';
		} else if (_item.title === postsHelper.postTypes.lists_add) {
			intent_text = 'added';
			//post_intent_text = 'to List';
		}

		var feed_item = {
			title : user_name + ' ' + intent_text + ' ' + activity_name,
			description : '<p><a href="http://care.ly/feature/toddlers/"><img src="$$URL$$" alt="$$NAME$$" height="16" width="16" border="0" align="left"></a></p>',
			url : 'http://care.ly/feature/toddlers/',
			//image_url : 'http://storage.cloud.appcelerator.com/O1PXfPqYupDDbuJMDvBNVOkXaMphOYCZ/photos/80/1d/51e5590d77b5c90ad734d654/carely_icon%402x_original.png',
			guid : _item.id,
			//categories: ['Category 1','Category 2','Category 3','Category 4'], // optional - array of item categories
			author : user_name,
			date : _item.updated_at
		}

		if (user_image) {
			feed_item.description = feed_item.description.replace('$$NAME$$', user_name);
			feed_item.description = feed_item.description.replace('$$URL$$', user_image);
		} else if (activity_image) {
			feed_item.description = feed_item.description.replace('$$NAME$$', activity_name);
			feed_item.description = feed_item.description.replace('$$URL$$', activity_image);
		}
		else{
			feed_item.description = '';
		}
		
		if (_item.content && _item.content !== '!#!none!#!' && _item.content !== activity_name) {
			feed_item.description += '<p>$$CONTENT$$</p>'.replace('$$CONTENT$$', _item.content);	
		}
		//console.log("feed_item: " + JSON.stringify(feed_item));
		
		return feed_item;
	}
}

function rss(req, res) {

	//console.log("req: " + JSON.stringify(req.query));

	var qParams = {
		where : {
			tags_array : 'list_tag_' + req.query.id
		},
		order : '-updated_at',
		page : 1,
		per_page : 10,
		response_json_depth : 3
	}

	ACS.Posts.query(qParams, function(data) {
		var xml = {};

		if (data && data.posts && data.posts.length) {
			var feed = new RSS({
				title : 'Toddler play',
				description : '<img alt="Toddler play" src="http://storage.cloud.appcelerator.com/O1PXfPqYupDDbuJMDvBNVOkXaMphOYCZ/photos/80/1d/51e5590d77b5c90ad734d654/carely_icon%402x_original.png" height="57" width="57"><b>Toddler play</b><p>Discover and share activities for your toddler:</p><ul><li>Follow one of the many activity lists: from finger puppets to creative crafts to outdoor activities</li><li>See photos of exciting activities and get inspired to try something new</li><li>Ask how-to questions and get helpful tips</li><li>Connect with friends and share your own activities</li></ul>',
				feed_url : req.originalUrl,
				site_url : 'http://care.ly/feature/toddlers/',
				image_url : 'http://storage.cloud.appcelerator.com/O1PXfPqYupDDbuJMDvBNVOkXaMphOYCZ/photos/80/1d/51e5590d77b5c90ad734d654/carely_icon%402x_original.png',
				docs : 'http://care.ly/feature/toddlers/',
				author : 'Toodler play',
				managingEditor : 'Toodler play',
				webMaster : 'Toodler play',
				copyright : '2013 Carely',
				language : 'en',
				categories : ['Category 1', 'Category 2', 'Category 3'],
				pubDate : 'May 20, 2012 04:00:00 GMT',
				ttl : '60'
			});

			for (var i = 0, v = data.posts.length; i < v; i++) {
				
				var feed_item = postsHelper.convertToRssItem(data.posts[i]);
				if(feed_item && feed_item.title){
					feed.item(feed_item);
				}
			}

			xml = feed.xml();
		}
		
		res.contentType('rss');
		res.send(xml);
	});
}