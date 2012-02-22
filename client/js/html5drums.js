/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */

// ===== VARIABLES =====
var isPlaying = false;
var curBeat = 0;
var curTempo = 120;
var $seq = {};

// ===== FUNCTIONS =====
// playBeat: Play the next beat!
function playBeat() {
    if (isPlaying !== false) {
		var nextBeat = 60000 / curTempo / 4;
		// Turn off all lights on the tracker's row
		$("#tracker li.pip").removeClass("active");
		// Light up the tracker on the current pip
		$("#tracker li.pip.col_" + curBeat).addClass("active");
		// Find each active beat, play it
		var tmpAudio;
		$(".soundrow[id^=control] li.pip.active.col_" + curBeat).each(function(i){
			tmpAudio = document.getElementById($(this).data('sound_id'));
			if (!tmpAudio.paused) {
				// Pause and reset it
				tmpAudio.pause();
				tmpAudio.currentTime = 0.0;
			}
			tmpAudio.play();
		});
		// Move the pip forward
		curBeat = (curBeat + 1) % 16;
	} // if (isPlaying)
} // playBeat

// Make a new hash
function buildHash() {
   /*
	// Start it
	var newhash = '';
	// For each pip, check and add in a 0/1 as appropriate
	$(".soundrow[id^=control] li.pip").each(function(i){
		newhash += $(this).is('.active') ? '1' : '0';
	});
	// Separate it
	newhash += '|';
	// Now, toss in the beat
	newhash += $('#temposlider').slider('value');
	// Check and see if we really need to update
	if (location.hash != '#' + newhash) location.hash = newhash;
	*/
} // buildHash

// Read in our hash
function parseHash() {
	if (location.hash.length > 0) {
		// Split it up, work it out, removing the actual hashmark
		var pieces = location.hash.substring(1).split('|');
		// Set the lights
		var lights = pieces[0];
		$(".soundrow[id^=control] li.pip").each(function(i){
			// Make sure we haven't exceeded
			if (i >= lights.length) return false;
			// Check our location, turn on class if need be
			if (lights.charAt(i) == '1') {
				$(this).addClass('active');
			}
		});
		// Set the tempo
		if (typeof pieces[1] !== 'undefined') {
			$('#temposlider').slider('value', parseInt(pieces[1]));
			$('#tempovalue').innerHTML = pieces[1];
			curTempo = parseInt(pieces[1]);
		}
	}
} // parseHash

// Clear it!
function clearAll() {
	$(".soundrow[id^=control] li.active").removeClass('active');
}

function updateState($beat, color) {
   	$beat.toggleClass('active');
					
	if($beat.hasClass('active')) {
	   $beat.css({'background-color':color})
	}
}

// Run on DOM ready
$(document).ready(function(){
	// Process each of the audio items, creating a playlist sort of setup
	$("audio").each(function(i){
		// Make a self reference for ease of use in click events
		var self = this;

		// Make a sub-list for our control
		var $ul = $('<ul id="control_' + this.id + '" class="soundrow">');
		$ul.append('<li class="header">' + this.title + '</li>');
        
        $seq[self.id] = []
        
		// Add 16 list items!
		for (j = 0; j < 16; j++) {
            $seq[self.id][j] = 0;
			var $li =
				$('<li class="pip col_'+j+'">["'+self.id+'",'+j+']</li>')
				.click(function(){
   					usercolor = '#'+$('input[name=colour]').val()
					updateState($(this), usercolor)
					//buildHash();
               		//alert($(this).html())

               		$state.submitOp({
    					p: eval($(this).html()),
						ld:0, oi:{'name':username,'color':usercolor}
					});	
				})
				.data('sound_id', self.id);
			$ul.append($li);
		} // for (i = 0; i < 16; i++)
		// Append it up
		$('<li>').append($ul).appendTo('#lights');
	});

	// Bind up a click for our button
	$("#soundstart").click(function(){
		if (isPlaying === false) {
			// Start the playing!
			curBeat = 0;
			isPlaying = setInterval(playBeat, 60000 / curTempo / 4);
			// Change our display
			this.innerHTML = "Stop!";
		} else {
			clearInterval(isPlaying);
			isPlaying = false;
			$("#tracker li.pip").removeClass("active");
			$("audio").each(function(){
				this.pause();
				this.currentTime = 0.0;
			});
			this.innerHTML = "Start!";
		}
	});

	$('#clearall').click(clearAll);
	$('#reload').click(parseHash);

	// ===== Misc =====
	// Build or read the hash
	if (location.hash == '') {
		// I was building this at load - but now, no, just to be safe
		//buildHash();
	} else {
		parseHash();
	}

	// Show our value, now that we've built off of the hash
	$('#tempovalue').html(curTempo);
	// Make our tempo slider
	$('#temposlider').slider({
		'value': curTempo,
		'min': 30,
		'max': 180,
		'step': 10,
		'slide': function(e, ui) {
			curTempo = ui.value;
			$('#tempovalue').html(curTempo);
			if (isPlaying !== false) {
				clearInterval(isPlaying);
				isPlaying = setInterval(playBeat, 60000 / curTempo / 4);
			}
		},
		'stop': function(e, ui) {
			buildHash();
		}
	});
    
    var randomDocName = function(length) {
        var chars, x;
        if (length == null) {
			length = 10;
		}
		chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-=";
		var name = [];
		for (x = 0; x < length; x++) {
			name.push(chars[Math.floor(Math.random() * chars.length)]);
		}
		return name.join('');
	};
    
	// from http://www.quirksmode.org/js/cookies.html
	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

	var username;
	if (!(username = readCookie('username'))) {
		username = randomDocName(3);
		createCookie('username', username, 5);
	}
    
    function stateUpdated(op) {
    	
		if (op) {
            user_src = op[0]['oi'].name
            color_src = op[0]['oi'].color
            sound_id = op[0]['p'][0]
            step = op[0]['p'][1]
            alert(user_src)
            if(user_src != username) {
                updateState($('ul#control_'+sound_id+' > .col_'+step),color_src)
            }
		} else {
            
		}
	}
    
    var $state;
    if (!document.location.hash) {
        document.location.hash = '#' + randomDocName();
    }
    var docname = 'loop:' + document.location.hash.slice(1);
    
    sharejs.open(docname, 'json', function(error, doc) {
        $state = doc;
        doc.on('change', function (op) {
            stateUpdated(op);
        });
        if (doc.created) {
            doc.submitOp([{p:[],od:null,oi:$seq}]);
        } else {
            snapshot = doc.snapshot
            for(sound_id in snapshot) {
                for(step in snapshot[sound_id]) {
                    if(snapshot[sound_id][step] != 0) {
                        alert(snapshot[sound_id][step].color)
                        $('ul#control_'+sound_id+' > .col_'+step).addClass('active').css({'background-color':snapshot[sound_id][step].color})
                    }
                }
            }
        }
    });
    
    jQuery('select#color-picker').colourPicker({
      ico:    '/assets/jquery.colourPicker.gif', 
      title:    false
   });
});
