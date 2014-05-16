jQuery.fn.extend({
    TTT: function (config) {

        var inputBox = this;

        var settings = {
            'label': true,
            'width': '125px',
            'height': 'auto',
            'minIncriment': '1',
            'labelBackColor': '',
            'labelTextColor': '',
            'onSuccess': '',
            'onFailure': '',
            'onEnter': ''
        };

        if (config) { jQuery.extend(settings, config); }
        var hasSuccessMethod = false;
        var hasFailureMethod = false;
        var hasEnterMethod = false;
        if (typeof settings.onSuccess == 'function') {
            hasSuccessMethod = true;
        }
        if (typeof settings.onFailure == 'function') {
            hasFailureMethod = true;
        }
        if (typeof settings.onEnter == 'function') {
            hasEnterMethod = true;
        }

        var data = {
            'startHour': '',
            'startMin': '',
            'endHour': '',
            'endMin': '',
            'StartTime': '',
            'EndTime': '',
            'invalid': false,
            'startAP': '',
            'endAP': ''
        };

        this.css('width', settings.width).css('height', settings.height);
        if (settings.label === true) {
            $('.TTT_Label_Div').remove();
            var TTT_Label_Div = $('<div></div>').addClass('TTT_Label_Div');
            $(TTT_Label_Div).css('width', settings.width).css('height', settings.height).css('background-color', settings.labelBackColor).css('color', settings.labelTextColor);
            var TTT_Label_Center = $('<center></center>');
            var TTT_Label = $('<label></label>').addClass('TTT_Label');
            $(TTT_Label).text('ex. 8a-5p');
            $(TTT_Label_Div).append($(TTT_Label_Center));
            $(TTT_Label_Center).append($(TTT_Label));
            $(this).after($(TTT_Label_Div));
            $(TTT_Label_Div).position({ of: $(this), my: 'left top', at: 'left bottom' }); // ma 3/26 change the position of the text to the bottom
        }
        var TTTinvalid = false;

        this.keyup(function (e) {
            data = {
                'startHour': '',
                'startMin': '',
                'endHour': '',
                'endMin': '',
                'StartTime': '',
                'EndTime': '',
                'invalid': false,
                'startAP': '',
                'endAP': ''
            };
            var time1 = inputBox.val().split(' ').join('');
            time1 = time1.toLowerCase();
            var charTime = time1.split('');


            var start = true;
            $.each(charTime, function (i, item) {
                if (!TTTinvalid) {
                    /* 
                    *   check if they have enter a vaild data to repersent spliting time
                    *   Current accepted "-" && "to"
                    */
                    if (item == "-" || (charTime[i] == "t" && charTime[i + 1] == "o")) {
                        start = false;
                    }
                    if ((item >= 0 && item < 24) || item == "a" || item == "p" && item != " ") {
                        if (start) {/*StartTime*/
                            if (item == "a" || item == "p") {
                                /* Sets AM or PM if a or p given*/
                                data.startAP = item;
                            } else if (data.StartTime.length < 5) {
                                /*parseTime(time, item, i, charTime)*/
                                data.StartTime = parseTime(data.StartTime, item, i, charTime);
                            }
                        } else {/*EndTime*/
                            if (item == "a" || item == "p") {
                                /* Sets AM or PM if a or p given*/
                                data.endAP = item;
                            } else if (data.EndTime.length < 5) {
                                /*parseTime(time, item, i, charTime)*/
                                data.EndTime = parseTime(data.EndTime, item, i, charTime);
                            }
                        }
                    }
                }
            });
            /*****************************************************************************************************
            *
            *  Only if there is both a vaild Start & End Time
            *
            *****************************************************************************************************/
            if (data.StartTime.length > 0 && data.EndTime.length > 0) {

                data.StartTime = fixTimeFormat(data.StartTime);
                data.EndTime = fixTimeFormat(data.EndTime);

                /*****************************************************************************************************
                * Spliting up the fomated times determining AM / PM and fauther out put. 
                *
                *****************************************************************************************************/
                var splitStartTime = data.StartTime.split(':');
                var splitEndTime = data.EndTime.split(':');
                data.startHour = parseInt(splitStartTime[0], 0);
                data.startMin = parseInt(splitStartTime[1], 0);
                data.endHour = parseInt(splitEndTime[0], 0);
                data.endMin = parseInt(splitEndTime[1], 0);
                /* Determining AM or Pm for Start  & End Time*/
                if (data.startHour > 12) {
                    data.startAP = "p";
                    data.startHour = data.startHour - 12;
                }
                if (data.endHour > 12) {
                    data.endAP = "p";
                    data.endHour = data.endHour - 12;
                }
                if (data.startHour === 0) {
                    data.startAP = "a";
                    data.startHour = 12;
                }
                if (data.endHour === 0) {
                    data.endAP = "a";
                    data.endHour = 12;
                }
                if (data.startAP.length > 0) {
                    if (data.startAP == "a") {
                        data.startAP = "AM";
                    } else {
                        if ((data.startHour >= data.endHour) && (data.startMin >= data.endMin) && (data.endAP.length === 0) && (data.startHour != 12)) {
                            data.endAP = "AM";
                        }
                        data.startAP = "PM";
                        data.startHour = data.startHour + 12;
                    }
                } else {
                    if (((data.startHour > data.endHour) || (data.startHour == data.endHour)) || (data.startHour < 12)) {
                        data.startAP = "AM";
                    } else {
                        data.startAP = "PM";
                        data.startHour = data.startHour + 12;
                    }
                }
                if (data.endAP.length > 0) {

                    if (data.endAP == "a") {
                        data.endAP = "AM";
                    } else if (data.endAP == "p") {
                        data.endAP = "PM";
                    }
                } else {
                    if (((data.startHour < data.endHour) && ((data.startHour < 12) && (data.endHour < 12))) || (data.startHour == 12 && data.startAP == "AM")) {
                        data.endAP = "AM";
                    } else {
                        data.endAP = "PM";

                    }
                }

                /* Sets up for times.*/
                var newStartTime = new Date(1992, 4, 28, data.startHour, data.startMin);
                var newEndTime = new Date(1992, 4, 28, data.endHour, data.endMin);
                data.startHour = (newStartTime.getHours() > 12 ? newStartTime.getHours() - 12 : newStartTime.getHours());
                data.endHour = (newEndTime.getHours() > 12 ? newEndTime.getHours() - 12 : newEndTime.getHours());
                data.startMin = newStartTime.getMinutes();
                data.endMin = newEndTime.getMinutes();

                /*function checkMinute(min, minIncrement)*/
                data.endMin = checkMinute(data.endMin, settings.minIncriment);
                if (data.endMin == 60) {
                    if (data.endHour == 11 && data.endAP == "AM") {
                        data.endAP = "PM";
                    }
                    if (data.endHour == 11 && data.endAP == "PM") {
                        data.endAP = "AM";
                    }
                    data.endHour += 1;
                    data.endMin = 0;
                }
                data.startMin = checkMinute(data.startMin, settings.minIncriment);
                if (data.startMin == 60) {
                    if (data.startHour == 11 && data.startAP == "AM") {
                        data.startAP = "PM";
                    }
                    if (data.startHour == 11 && data.startAP == "PM") {
                        data.startAP = "AM";
                    }
                    data.startHour += 1;
                    data.startMin = 0;
                }
                if (data.startHour == 0 && data.startAP == "PM") {
                    data.StartTime = data.startHour + 12 + ":" + (data.startMin > 9 ? data.startMin : 0 + "" + data.startMin) + " " + data.startAP;
                } else {
                    /* Sets the Times for showing in the label*/
                    data.StartTime = data.startHour + ":" + (data.startMin > 9 ? data.startMin : 0 + "" + data.startMin) + " " + data.startAP;
                }
                if (data.endHour == 24 && data.endAP == "PM") {
                    data.endHour -= 12;
                    data.EndTime = data.endHour - 12 + ":" + (data.endMin > 9 ? data.endMin : 0 + "" + data.endMin) + " " + data.endAP;
                } else {
                    /* Sets the Times for showing in the label*/
                    data.EndTime = data.endHour + ":" + (data.endMin > 9 ? data.endMin : 0 + "" + data.endMin) + " " + data.endAP;
                }

                /*function checkHour(hour, AMorPM)*/
                data.startHour = checkHour(data.startHour, data.startAP);
                data.endHour = checkHour(data.endHour, data.endAP);
            }

            /*****************************************************************************************************
            *
            *   What is set and returned
            *
            ******************************************************************************************************/
            if (!TTTinvalid) {
                if (hasSuccessMethod) {
                    settings.onSuccess(data);
                }
                $('.TTT_Label').text(data.StartTime + " - " + data.EndTime);
                //genericTTT(data.startHour, data.startMin, data.endHour, data.endMin, data.StartTime, data.EndTime, false)
            } else {
                if (hasFailureMethod) {
                    settings.onFailure();
                }
                $('.TTT_Label').text("Invalid");
                //genericTTT("0", "0", "0", "0", "0", "0", true);
            }

            if (e.keyCode == 13) {
                if (hasEnterMethod) {
                    settings.onEnter(data);
                }
            }
            if (e.keyCode == 8) {
                $('.TTT_Label').text('ex. 8a-5p');
            }

            if (e.keyCode == 27) {
                $('.TTT_Label_Div').hide();
                $('.timeInput').hide();
            }

        }).focus();

    }
});

/*****************************************************************************************************
*
*
*   Functions Used
*
*
*****************************************************************************************************/
/*
*   Dustin Damesworth 09/19/2013
*   Checking if time is in 5 min increment 
*   you can change increment by changing 
*   checkMinute(min, minIncrement);
*/
function checkMinute(min, minIncrement) {
    var setMin = min;
    var mod = (min % minIncrement);
    if (mod < (minIncrement / 2)) {
        setMin = (min - mod);
    }
    else {
        setMin = (min + (minIncrement - mod));
    }
    return setMin;
}

/*
* Dustin Damesworth 09/19/2013
*   Checks if the time is AM or PM and converts it to 24 hour
* checkHour(hour, AMorPM)
*/
function checkHour(hour, AMorPM) {
    var setHour = hour;
    if (AMorPM == "PM" && hour != 12) {
        setHour += 12;
    }
    else if (hour == 12 && AMorPM == "AM") {
        setHour -= 12;
    }
    return setHour;
}
/*
*    Dustin Damesworth 09/19/2013
*     formats the time in 00:00 format.
*    fixTimeFormat(time)
*/
function fixTimeFormat(time) {
    var setTime = time;
    if (setTime.length == 1) {
        setTime = "0" + setTime + ":00";
    }
    while (setTime.length < 5) {
        if (setTime.length == 2) {
            setTime += ":";
        }
        setTime += "0";
    }
    return setTime;
}

/*
* Dustin Damesworth 09/19/2013
*   parses the time and returns the new time.
*  parseTime(time, item, i, charTime)
*/
function parseTime(time, item, i, charTime) {
    var setTime = time;
    if (setTime.length == 2) {
        setTime += ":";
    }
    if (setTime.length == 3) {
        if (item > 5) {
            TTTinvalid = true;
        } else {
            setTime += item;
        }
    } else {
        if (setTime.length < 1) {
            if ((charTime[i] == 2 && charTime[i + 1] < 4) || (charTime[i] == 1 && charTime[i + 1] <= 9 && charTime[i + 2] == ":") || (item < 1) || (charTime[i] == 1 && charTime[i + 1] < 3)) {
                setTime += item;
            } else {
                setTime += 0;
                setTime += item;
            }
        } else {
            setTime += item;
        }
    }
    return setTime;
}

