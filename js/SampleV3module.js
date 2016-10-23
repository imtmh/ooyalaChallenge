/**
* Â©2012-2013 Ooyala, Inc.All Rights Reserved.*/
// sampleV3module.js
// Each custom module must be defined using the OO.plugin method
// The first parameter is the module name
// The second parameter is a factory function that will be called by
// the player to create an instance of the module. This function must
// return a constructor for the module class (see the end of this example)

OO.plugin("SampleUIModule", function (OO, _, $, W) {
    /**
     * Custom UI Sample Module
     * Modules developed using this template can later be embedded
     * within Ooyala'sâ„¢ player for syndication.
     *
     * A sample UI module to demonstrate how to build a custom UI
     * instead of loading our default UI. This module contains a 
     * simple play/pause button and scrubber bar.
     * Parameters:
     * OO, namespace for PlayerV3
     * _, a reference to underscore.js lib.
     * $, a reference to jQuery lib.
     * W, a reference to window object.
     */

    // load jquery UI lib and css:
    var Sample = {};
    $('head').append('<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css">');

    // This section contains the HTML content to be used as the UI
    var CUSTOMER_TEMPLATE = '<div class="customer_ui">' +
            '<div class="playPause"/>'+
            '<span>Current Time:</span><span class="currentTime"></span>' +
            '<span>Duration:</span><span class="duration"></span>' +
            '<div class="slider" style="margin-top:20px; width:640px;"></div>'
        +'</div>';

    // A constructor for the module class
    // will be called by the player to create an instance of the module
    // First parameter is a reference to a message bus object, which
    // is required to be able to pub/sub to player events.
    // Second parameter is a unique id assigned to the module for
    // debugging purposes
    Sample.SampleUIModule = function (mb, id) {
        this.mb = mb; // save message bus reference for later use
        this.id = id;
        this.duration = NaN;
        this.playing = false;
        this.init(); // subscribe to relevant events
    };

    // public functions of the module object
    Sample.SampleUIModule.prototype = {
        init: function () {
            // subscribe to relevant player events
            this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'customerUi',
            _.bind(this.onPlayerCreate, this));
            this.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED,
                'customerUi', _.bind(this.onTimeUpdate, this));
            console.log("before CONTENT_TREE_FETCHED");
            this.mb.subscribe(OO.EVENTS.CONTENT_TREE_FETCHED,
                'customerUi', _.bind(this.onContentReady, this));
        },

        // Handles the PLAYER_CREATED event
        // First parameter is the event name
        // Second parameter is the elementId of player container
        // Third parameter is the list of parameters which were passed into
        // player upon creation.
        // In this section, we use this opportunity to create the custom UI
        onPlayerCreate: function (event, elementId, params) {
          
            this.playerRoot = $("#" + elementId);
            this.rootElement = this.playerRoot.parent();
            this.playerRoot.find(".plugins").append("<div class='fooMessage' </div>");

            console.log("hello, init here!!!", this.rootElement, this.id);
            $(CUSTOMER_TEMPLATE).insertAfter("#" + elementId);


            W.$( ".slider" ).slider({
                stop: _.bind(this.onSliderStop, this),
                slide: _.bind(this.onSlide, this)
            });
            const parent = this;
            W.$(".playPause").click(function() {
                $(this).toggleClass("active");
                if(parent.playing){
                    parent.onPause();
                }else {
                    parent.onPlay();

                }
            });
        },

        // Handles CONTENT_TREE_FETCHED event
        // Second parameter is a content object with details about the
        // content that was loaded into the player
        // In this example, we use the parameter to update duration
        onContentReady: function (event, content) {
            console.log(content);
            this.duration = content.duration / 1000;
            this.rootElement.find(".duration").html(this.duration);
            this.videoInput = document.getElementById('videoTitle')
            this.videoInput.onblur = function(e){
                console.log("onBlur");
                makeAPICall(content.embed_code, e.target.value);
            };
            this.videoInput.value=content.title;
            
            W.$( ".slider" ).slider("option", "max", this.duration);
        },

        // Handles PLAYHEAD_TIME_CHANGED event
        // In this example, we use it to move the slider as content is played
        onTimeUpdate: function (event, time, duration, buffer) {
            // update scrubber bar.
            if (duration > 0) {
                this.duration = duration;
            }
            this.rootElement.find(".currentTime").html(Math.round(time));
            this.rootElement.find(".duration").html(Math.round(this.duration));
            W.$( ".slider" ).slider("option", "max", this.duration);
            W.$( ".slider" ).slider("option", "value", time);
        },

        onPlay: function () {
            this.playerRoot.find(".fooMessage").remove();
            this.rootElement.find('video.video').css('left', '0px');
            //this is temporary code.
            this.play();
            this.playing = true;
        },

        onPause: function () {
            this.pause();
            this.playing = false;
        },

        // Sends PLAY event to start playing the video
        play: function () {
            this.mb.publish(OO.EVENTS.PLAY);
        },

        // Sends PAUSE event to pause the video
        pause: function () {
            this.mb.publish(OO.EVENTS.PAUSE);
        },

        // Sends SEEK event to seek to specified position
        seek: function (seconds) {
            this.mb.publish(OO.EVENTS.SEEK, seconds);
        },

        onSlide: function (event, ui) {
//            console.log("onSlide");
            if (this.playing) {
                this.pause();
            }

        },
        onSliderStop: function (event, ui) {
            this.seek(ui.value);
            if (this.playing) {
                this.play();
            }
        },

        __end_marker: true
    };

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return Sample.SampleUIModule;
});
