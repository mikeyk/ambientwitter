var templating = templating ? window.templating : new Object();

templating.outputSelect = function(targetId,classname, name,  label, options){
	var container = $("<div id=\"setting-container\"><span class='label'>"+ label +" </span><br/></div>");
	var select = $("<select class=\"" + classname + "\" id=\"" + name + "\"></select>");
	select.bind("change", function(){
		twitterAmbient.readOptions();
	})
	container.append(select);
	var curOption;
	for (var i = 0; i < options.length; i++) {
		curOption = document.createElement("option");
		var value, label;
		value = label = options[i];
		if (/\|/.test(options[i])) {
			label = options[i].split("|")[0];
			value = options[i].split("|")[1];					
		}
		curOption.value = value;
		curOption.innerHTML = label;
		select.append(curOption);
	}
	$("#" + targetId).append(container);
}

templating.outputColorInput = function(targetId, classname, name, label) {
	var container = $("<div id=\"setting-container\"><span class='label'>"+ label +" </span><br/></div>");
	var input = $("<input type='text' class=\"" + classname + "\" id=\"" + name + "\"></input>");
	input.bind("focus", function(){
	 	$("#colorpicker").show();
	    $.farbtastic("#colorpicker").linkTo('#' + this.id);
	})
	input.bind("blur", function(){
		$("#colorpicker").hide();
	})
	container.append(input);
	$("#" + targetId).append(container);			
}

var twitterAmbient = twitterAmbient ? window.twitterAmbient : new Object();


twitterAmbient.displayOptions = {
	'tweetcontainer_font-family': "Futura",
	'tweetcontainer_font-size': '3em',
	'maincontainer_color': '#000',			
	'maincontainer_background-color': '#ffe87c'
}


twitterAmbient.favsIndex  = 0;
twitterAmbient.tweetList = new Array();
twitterAmbient.curPage = 0;
twitterAmbient.numShown = 0;
twitterAmbient.fetchNewTolerance = 5;
twitterAmbient.animationNotStarted = true;
twitterAmbient.localTest = false;
twitterAmbient.loadedIndices = new Array();
twitterAmbient.orderedIndices = new Array();
twitterAmbient.currentIndex = 0;

twitterAmbient.timeBeforeRefreshingSearch = 1000 * 60 * 15; // 15 minutes

twitterAmbient.jsonFormat = "search";

twitterAmbient.functionalityOptions = {
	'refreshRate':7000
}

twitterAmbient.applyOptions = function(){
	for (var option in twitterAmbient.displayOptions){
		var element = option.split("_")[0];
		var property = option.split("_")[1];
		$('#'+element).css(property, twitterAmbient.displayOptions[option])	
	}
}

twitterAmbient.saveOptions = function(){
	var cookieString = "";
	
	for (var option in twitterAmbient.displayOptions){
		cookieString += option + "=" + twitterAmbient.displayOptions[option] + "|";
	}
	
	$.cookie("displayoptions", cookieString, {'expires':365});
	
	$("#save-feedback").fadeIn(function(){
		window.setTimeout(function(){
					$("#save-feedback").fadeOut();
				}, 2000);

	});
}

twitterAmbient.readOptions = function(){
	$(".displayoption").each(function(el){
		twitterAmbient.displayOptions[this.id] = $(this).val();
	});
	$(".functionalityoption").each(function(){
		if (this.id == "refreshRate" && $(this).val() != twitterAmbient.functionalityOptions['refreshRate']) {
			window.clearTimeout(twitterAmbient.nextTimer);
			twitterAmbient.loadNextTweet();					
		}
		twitterAmbient.functionalityOptions[this.id] = $(this).val();
	});
	twitterAmbient.applyOptions();
	// this.options['font-family'] = $("#")
}

twitterAmbient.loadOptions = function(){
	
	if ($.cookie('displayoptions')) {
		var splitOptions = $.cookie("displayoptions").split("|");
		for (var i = 0; i < splitOptions.length; i++) {
			if (splitOptions[i] != "") {
				var key = splitOptions[i].split("=")[0];
				var value = splitOptions[i].split("=")[1];
			
				twitterAmbient.displayOptions[key] = value;
			}
		}
	}
	
	for (var option in twitterAmbient.displayOptions) {
		var el = $("#"+option);
		var val = twitterAmbient.displayOptions[option];
		if (el.get(0).type == "select-one") {
			el.selectOptions(val);
		} else {
			if (el.hasClass("colorinput")) {
				el.val(val);
				if (val == "#000") el.css('color','white');
				el.css("background-color",val);
			}
		}
		
	}
	for (var option in twitterAmbient.functionalityOptions) {
		$('#'+option).selectOptions(""+twitterAmbient.functionalityOptions[option]);
 	}
}

twitterAmbient.isSearch = false;

twitterAmbient.nextTimer;

twitterAmbient.animations = new Object;

twitterAmbient.animations.fade = new Object;		

twitterAmbient.animations.fade.show = function(callback){
	$("#tweetcontainer").fadeIn("normal", callback);
};

twitterAmbient.animations.fade.hide = function(callback){
	$("#tweetcontainer").fadeOut("normal", callback);
};		

twitterAmbient.animations.eachLetter = function(callback) {
	if (typeof callback != "undefined") {
		callback();
	}
	$(".individual-letter").css({"opacity":0});			
	var currentLetter = 0;
	for (var i = 0; i < twitterAmbient.tweetList[twitterAmbient.currentIndex]['text'].length; i++){
		window.setTimeout(function(){

			$("#letter-" + currentLetter).css({"position":"relative"});

			$("#letter-" + currentLetter).animate({"opacity": Math.random()});										
			$("#letter-" + currentLetter).show();	
			$("#tweetcontainer").show();
			currentLetter++;					
		}, 100);

	}			
}

twitterAmbient.currentAnimationFunction = twitterAmbient.animations.fade;


twitterAmbient.tweetsLoaded = function(response){
	
	var newTweetsList = (eval(response));
	for (var i = 0; i < newTweetsList.length; i++) {
		twitterAmbient.tweetList.push(newTweetsList[i]);
	}
	//console.log(tweetList);
	if (twitterAmbient.animationNotStarted) {
		twitterAmbient.loadNextTweet();
		twitterAmbient.animationNotStarted = false;
	}
}

twitterAmbient.searchTweetsLoaded = function(response){
	
	var newTweetList = (eval(response));

	twitterAmbient.lastFetchTime = new Date();

	twitterAmbient.tweetList = new Array();
	for (var i = 0; i < newTweetList.results.length; i++) {
		newTweetList.results[i]['user'] = {
			'screen_name': newTweetList.results[i]['from_user'],
			'name': newTweetList.results[i]['from_user'],
			'profile_image_url':newTweetList.results[i]['profile_image_url']
		}
		
		twitterAmbient.tweetList.push(newTweetList.results[i]);
	}
	//console.log(tweetList);
	if (twitterAmbient.animationNotStarted) {
		twitterAmbient.loadNextTweet();
		twitterAmbient.animationNotStarted = false;
	}
}


twitterAmbient.startAnimation = function(callback){
	twitterAmbient.currentAnimationFunction.show(callback);
}

twitterAmbient.endAnimation = function(callback){
	twitterAmbient.currentAnimationFunction.hide(callback);
}

twitterAmbient.loadNextTweet = function(){

	twitterAmbient.endAnimation(function(){
		
		var now = new Date();
		
		if (!twitterAmbient.isSearch && twitterAmbient.numShown == twitterAmbient.tweetList.length - twitterAmbient.fetchNewTolerance) {
			twitterAmbient.insertScriptTag(twitterAmbient.curPage++);
		} else if (twitterAmbient.isSearch && (now-twitterAmbient.lastFetchTime > twitterAmbient.timeBeforeRefreshingSearch)) {
			twitterAmbient.insertScriptTag(twitterAmbient.curPage++);
		}
		var randomNum;
		for (var attempts = 0; attempts < 3; attempts++){
			randomNum = Math.floor(Math.random() * twitterAmbient.tweetList.length);
			if (!twitterAmbient.loadedIndices[randomNum] == true) break;
		}

		twitterAmbient.numShown++;					
		twitterAmbient.loadedIndices[randomNum] = true;
		twitterAmbient.orderedIndices.push(randomNum);
		twitterAmbient.currentIndex = randomNum;
		var curObj = twitterAmbient.tweetList[randomNum];
		
		if (curObj) {
			var textSpans = "";
			var parsedText = curObj['text'];

			parsedText = parsedText.replace(/(http[:|s:]\/\/[^ ,""\s<]*)/g, "<a target=\"_blank\" href=\"$1\">$1</a>");				
			parsedText = parsedText.replace(/#(\w+)/g, "<a target=\"_blank\" href=\"http://search.twitter.com/search?q=%23$1\">#$1</a>");

			parsedText = parsedText.replace(/@(\w+)/g, "<a target=\"_blank\" href=\"http://twitter.com/$1\">@$1</a>");


			// /#(\w+)/.test(nextLetter) && index < curObj['text'].length){
			// 			linkedText += nextLetter;
			// 			index++;
			// 			if (index > curObj['text'].length) break;
			// 			nextLetter = curObj['text'][index];
			// 		}
			// 		letter = index-1;
			// 		if (isAtName) {
			// 			textInSpan = "<a target=\"_blank\" href=\"http://twitter.com/" + linkedText + "\">@" + linkedText + "</a>";
			// 		} else {
			// 			textInSpan = "
			// 		}						
				// } else {
				// 	textInSpan = curObj['text'][letter];
				// }
				// textSpans += "<span class=\"individual-letter\" >" + textInSpan + "</span>";
			// }

			var screen_name = curObj["user"]["screen_name"];
			var profile_image_url = curObj['user']['profile_image_url'];
			var display_name = curObj['user']['name'];
			var date = new Date(curObj['created_at']);
			var in_reply_to_screen_name = curObj['in_reply_to_screen_name'];
			var in_reply_to_status_id = curObj['in_reply_to_status_id'];
			var in_reply_to_user_id = curObj['in_reply_to_user_id'];	

			$("#tweetcontainer").html("");
			$("#tweetcontainer").append(parsedText);
			$("#tweetcontainer").append("<div id='userinfo'></div>");
			$("#userinfo").append("<span class=\"username\"><a target=\"_blank\" href=\"http://twitter.com/"+ screen_name + "\">"  + "<div class='profile_image' style='background:url(\"" + profile_image_url + "\")'><img class='hidden_profile_image' src=\"" + profile_image_url + "\"></div>" + display_name + "</a></span>");
			var whichMonth = parseInt(date.getMonth()) + 1;
			$("#userinfo").append("<div class=\"date\">" + whichMonth + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes() + "</div>")
			if (in_reply_to_screen_name) {
				if (in_reply_to_status_id){
					var url = "http://twitter.com/" + in_reply_to_screen_name + "/status/" + in_reply_to_status_id;
				} else {
					var url = "http://twitter.com/" + in_reply_to_screen_name;
				}
				$("#userinfo").append("<span class='in_reply_to'>in reply to <a target=\"_blank\" href=\""+ url + "\">" + in_reply_to_screen_name +"</a></span>");
			}


			twitterAmbient.startAnimation();
			twitterAmbient.nextTimer = window.setTimeout(twitterAmbient.loadNextTweet, twitterAmbient.functionalityOptions['refreshRate']);
		}

	
		
	});

}

twitterAmbient.playOrPause = function(){
	if ($("#playpause").val() == "pause") {
		window.clearTimeout(twitterAmbient.nextTimer);
		$("#playpause").val("play");
	} else {
		twitterAmbient.loadNextTweet();
		$("#playpause").val("pause");
	}
}

twitterAmbient.insertScriptTag = function(index){
	var scriptTag = document.createElement("script");
	if (twitterAmbient.localTest) {
		scriptTag.src = "/media/1/global/search.json";				
	} else if (twitterAmbient.isSearch) {
		scriptTag.src = twitterAmbient.baseURL + "page=1&rpp=100&callback=twitterAmbient.searchTweetsLoaded";
		// scriptTag.src = twitterAmbient.baseURL + "page=" + index + "&callback=twitterAmbient.searchTweetsLoaded";	
	}else {
			scriptTag.src = twitterAmbient.baseURL + "page=" + index + "&callback=twitterAmbient.tweetsLoaded";
	}
	document.body.appendChild(scriptTag);
}