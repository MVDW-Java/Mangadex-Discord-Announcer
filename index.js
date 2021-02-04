//Settings
var mangadex_token = "YOUR_MANGADEX_TOKEN";
var discord_webhook = "YOUR_DISCORD_WEBOOK_URL";
var discord_thumbnail = "IMAGE_URL_FOR_THUMBNAIL";
var prefix_filter = "Ijiranaide, Nagatoro-san - "; // example prefix filter
var timeout = 60;
var mysql_host = "localhost";
var mysql_user = "";
var mysql_pass = "";
var mysql_db = "mangadex";

//Imports
const feed = require('feed-read');
const mysql = require('mysql');
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const hook = new Webhook(discord_webhook);

var con = mysql.createConnection({host: mysql_host, user: mysql_user, database: mysql_db });

function requestFeed() {
	feed("https://mangadex.org/rss/follows/" + mangadex_token, onRssFetched);
}

function onRssFetched(err, articles) {
	
	if(err) throw err;
	
	con.query("SELECT * FROM announced", function (err, result) {
		if(err) throw err;
		
		var list = [];


		for (i = 0; i < result.length; i++) { 
			if(!list.includes(result[i].title)) list.push(result[i].title);
		}

		for (i = 0; i < articles.length; i++) { 
			if(!list.includes(articles[i].title)){
				
				list.push(articles[i].title);
				
				con.query("INSERT INTO announced (title) VALUES ('" + articles[i].title + "')");
				
				var filterd = articles[i].title;
				filterd = filterd.replace(prefix_filter, "");
				console.log("Manga " + filterd + " Has been added.");
			
				const embed = new MessageBuilder()
					.setTitle(filterd)
					.setColor("#aabbcc")
					.setDescription("New chapter just released!\nCheck it out in the link below:\n\n" + articles[i].link)
					.setURL(articles[i].link)
					.setFooter("Announcer developed by MVDW-Java on Github.")
					.setThumbnail(discord_thumbnail)
					.setTimestamp();

				hook.send(embed);
			}	
		}
	});
}

setInterval(requestFeed, timeout * 1000);
requestFeed();