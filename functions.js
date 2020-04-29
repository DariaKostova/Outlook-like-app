/**
*  Authentication
*/
var photos = ["/assets/images/ivan.jpg", "/assets/images/didi.jpeg", "/assets/images/aleks.jpeg", "assets/images/damyan.jpeg", "/assets/images/geri.jpeg"];
var clientId = '997092483333-mpiko5jkppnvnn7a8ftib69knukc19ss.apps.googleusercontent.com';
var apiKey = 'AIzaSyDOTUgwzIpBvf1eRjWMKfrtET5G_E7M8hk';

var scopes = 'https://www.googleapis.com/auth/gmail.readonly';

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var calendarScopes = "https://www.googleapis.com/auth/calendar.readonly";
var contactScopes = 'https://www.googleapis.com/auth/contacts.readonly';

var pattern = new RegExp(/['"]+/g);

function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
}

function checkAuth() {
    gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: false
    }, handleAuthResult);
}

function handleAuthClick() {
    gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: false
    }, handleAuthResult);
    return false;
}

function handleAuthResult(authResult) {
    if(authResult && !authResult.error) {            
        loadGmailApi();
        $('#authorize-button').remove();
    } else {
        $('#authorize-button').removeClass("hidden");
        $('#authorize-button').on('click', function(){
            handleAuthClick();
        });
    }
}

function loadGmailApi() {
    // $('.emails-container').removeClass('hidden');
    $('#authorize-button').css('display', 'none');
    gapi.client.load('gmail', 'v1', displayInbox);
    
}

/**
*  display Emails
*/
function displayInbox() {
    $(".k-animation-container").css("visibility", "visible");
    $(".k-animation-container").addClass('message-container');
    $(".message-popup").data('kendoPopup').close();
    $(".app-head").addClass("hidden");
    $(".successful-authentication").removeClass("hidden");
    $(".k-tabstrip-wrapper").css("display", "block");
    
    //$(".k-animation-container").css({"display": "block!important", "visibility": "hidden"});
    //alert("Successful authorization!");
    var request = gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'labelIds': 'INBOX',
        'maxResults': 15
        });

    request.execute(function(response) {
        $.each(response.messages, function() {
            var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': this.id
            });

            messageRequest.execute(appendMessageRow);
        });
    });
}

function appendMessageRow(message) {
    $('#emails-inbox').append(
    '<tr>\
        <td>'+getHeader(message.payload.headers, 'From')+'</td>\
        <td>\
            <a href="#message-modal-' + message.id +
                '" data-toggle="modal" id="message-link-' + message.id+'">' +
                getHeader(message.payload.headers, 'Subject') +
            '</a>\
        </td>\
        <td>'+getHeader(message.payload.headers, 'Date')+'</td>\
    </tr>'
    );

    $('.message-body').append(
        '<div class="modal fade" id="message-modal-' + message.id +
                '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
            <div class="modal-dialog modal-lg">\
                <div class="modal-content">\
                    <div class="modal-header">\
                        <h4 class="modal-title" id="myModalLabel">' +
                        getHeader(message.payload.headers, 'Subject') +
                        '</h4>\
                    </div>\
                    <div class="modal-body">\
                        <iframe id="message-iframe-'+message.id+'" srcdoc="">\
                        </iframe>\
                    </div>\
                </div>\
            </div>\
        </div>'
    );

    $('#message-link-'+message.id).on('click', function(){           
        var iframe = $('#message-iframe-'+message.id)[0].contentWindow.document;
        //console.log(iframe);
        $('.message-popup').data('kendoPopup').open();
        $('body').addClass('hide-scroll');       
        $('body', iframe).html(getBody(message.payload));
        $('.modal.fade' + '#message-modal-' + message.id).siblings().addClass("hidden");
        $('.modal.fade' + '#message-modal-' + message.id).removeClass('hidden');      

    });    
}

function getHeader(headers, index) {
    var header = '';

    $.each(headers, function(){
        if(this.name === index) {
            header = this.value;
        }
    });
    return header;
}

function getBody(message) {
    var encodedBody = '';

    if(typeof message.parts === 'undefined')
    {
        encodedBody = message.body.data;
    }
    else
    {
        encodedBody = getHTMLPart(message.parts);
    }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

function getHTMLPart(arr) {
    for(var x = 0; x <= arr.length; x++)
    {
        if(typeof arr[x].parts === 'undefined')
        {
            if(arr[x].mimeType === 'text/html')
            {
            return arr[x].body.data;
            }
        }   
        else
        {
            return getHTMLPart(arr[x].parts);
        }
    }
    return '';
}


/**
 *  load my contacts
 */

function authorize() {
    gapi.auth.authorize({client_id: clientId, scope: contactScopes, immediate: false}, handleAuthorization);
}
var contactlist = [];
function handleAuthorization(authorizationResult) {
    // if (authorizationResult && !authorizationResult.error) {
    //     $.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + authorizationResult.access_token + "&alt=json",
    //         function (response) {
    //             //console.log(access_token);
    //             var contactEntries = response.feed.entry;
    //             //console.log(contactEntries);
    //             var contactlist = [];
    //             $.each(contactEntries, function(index,value){
    //                 var contactName = (JSON.stringify(value.title.$t)).replace(pattern, '');
    //                 var email = (JSON.stringify(value.gd$email[0].address)).replace(pattern, '');
    //                 var phone = (JSON.stringify(value.gd$phoneNumber[0].$t)).replace(pattern, '');
    //                 //var contactImg = (JSON.stringify(value.link[0].href)).replace(pattern, '');
    //                 var contactImg = (JSON.stringify(value.link[0].href)).replace(/['"]+/g, '') + "&access_token=" + authorizationResult.access_token;
    //                 console.log(contactImg.url);
    //                 if (contactImg !== null) {
    //                     fetch(contactImg)
    //                         .then((response) => {
    //                             let photo = response.url;
    //                             console.log(photo);
    //                         }
    //                         )
    //                     }
                
    //                 //var contactImg = photos[index];
    //                 var jobTitle = (JSON.stringify(value.gd$organization[0].gd$orgTitle.$t)).replace(pattern, '');
    //                 var companyName = (JSON.stringify(value.gd$organization[0].gd$orgName.$t).replace(pattern, ''));
    //                 //console.log(contactImg);
    //                 contactlist.push({ 
    //                     name: contactName, 
    //                     email: email, 
    //                     phone: phone, 
    //                     image: contactImg, 
    //                     job: jobTitle, 
    //                     company: companyName 
    //                 });
    //             })
    if (authorizationResult && !authorizationResult.error) {
    fetch(`https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=${authorizationResult.access_token}&max-results=25&v=3.0`)
                    .then((response) => {
                        return response.json();
                    })
                    .then((res) => {
                        let contactsResult = res.feed.entry;
                        contactsResult = contactsResult.filter(c => c.gd$name);
                        
                        contactsResult.forEach(c => {

                            const tryFn = (fn, fallback = null) => {
                                try {
                                    return fn();
                                } catch (error) {
                                    return fallback;
                                }
                            }
                            
                            let contactName = tryFn(() => c.gd$name.gd$fullName.$t, 'No name');
                            let jobTitle = tryFn(() => c.gd$organization[0].gd$orgTitle.$t, 'No job title');
                            let companyName = tryFn(() => c.gd$organization[0].gd$orgName.$t, 'No department');
                            let photoLink = tryFn(() => c.link[0].href);

                            if (photoLink) {
                                fetch(`${photoLink}&access_token=${authorizationResult.access_token}`)
                                    .then((response) => {
                                        let photo = response.url;
                                        console.log(photo);
                                        contactlist.push({ 
                                            name: contactName, 
                                            phone: phone, 
                                            image: photo, 
                                            job: jobTitle, 
                                            company: companyName 
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            } else {
                                let newContact = { contactFullName, contactTitle, department, photo: '' }
                                setContacts(oldContacts => [...oldContacts, newContact]);
                            }
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                    })

                            
                //console.log(contactlist);
                var dataSource = new kendo.data.DataSource({
                     data: contactlist
                })


                
                //console.log(dataSource);
                $("#contacts-listview").kendoListView({
                    dataSource: dataSource,
                    template: "<li>\
                    <div class=\"single-contact\">\
                        <span class=\"contact-img\" style=\"background-image:url('#:image#')\";></span>\
                        <h3><span class=\"contact-name\">#:name#</span></h3>\
                        <p><i class=\"fa fa-briefcase\" aria-hidden=\"true\"></i> <span>#:job#</span></p>\
                        <p><i class=\"fa fa-building\" aria-hidden=\"true\"></i> <span>#:company#</span></p>\
                        <p><i class=\"fa fa-envelope\" aria-hidden=\"true\"></i> <a href='mailto:#:email#'>#:email#</a></p>\
                        <p><i class=\"fa fa-mobile\" aria-hidden=\"true\" style='font-size: 18px'></i><a href='tel:#:phone#'>#:phone#</a></p>\
                    </div></li>"

                });
            }
        //)
    }
//}
   

/**
 * jQuery functions
 */
$(document).ready(function () {
    /**
     *  load my events
     */

    //var authorizeButton = document.getElementById('authorize-button');
    var showEvents = document.getElementById('synchronize-button');
    var schedulerCreated = false;
    $("#events-tab").on("click", function() {
        $(".contact-row").remove();        
        gapi.load('client:auth2', initClient);
    });

    // if($(".k-animation-container").children(".message-popup").length > 0) {
        
    // }
    
    function initClient() {
        gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: DISCOVERY_DOCS,
            scope: calendarScopes
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            
            showEvents.onclick = function handleAuthClick(event) {
                gapi.auth2.getAuthInstance().signIn();
            };
        }, function(error) {
            appendPre(JSON.stringify(error, null, 2));
        });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            showEvents.style.display = 'none';

            if(!schedulerCreated) {
                schedulerCreated = true;
                createScheduler();

            }
        } else {
            synchronizeButton.style.display = 'block';
        }
    }

    function createScheduler() {
        $("#events-scheduler").kendoScheduler({
            startTime: new Date("2020/4/4 07:00 AM"),
            height: 600,
            views: [ 
                "day",
                { type: "week", selected: true },
                "month",
                "agenda",
                "timeline"
            ],
            selectable: true,
            editable: true,
            dataSource: {
                batch: true,
                transport: {
                    read: function(schedulerRequest) {
                        gapi.client.load('calendar', 'v3', function() {
                            var request = gapi.client.calendar.events.list({
                                'calendarId': 'primary'
                            });
                
                            request.execute(function(resp) {
                                schedulerRequest.success(resp.items);
                            });
                        });            
                    },
                    parameterMap: function(options, operation) {
                        if (operation !== "read" && options.models) {
                            return {models: kendo.stringify(options.models)};
                        }
                    }
                },
                schema: {
                    parse: function(data) {            
                        var recurrences = [];
                        var parsedData = [];
                        for (var i = 0; i < data.length; i++) {
                            if(!data[i].start) {
                                continue;
                            }
                            //handle all day events
                            if(data[i].start['dateTime']) {
                                data[i].start = kendo.parseDate(data[i].start['dateTime']);
                                data[i].end = kendo.parseDate(data[i].end['dateTime']);
                            } else if(data[i].start['date']) {
                                data[i].start = kendo.parseDate(data[i].start['date']);
                                data[i].end = kendo.parseDate(data[i].end['date']);
                                data[i].isAllDay = true;
                            }
                
                            //parse recurrence
                            if(data[i].recurrence) {
                                data[i].recurrenceRule = data[i].recurrence[0];
                                data[i].recurrenceId = null;
                            } 
                
                            //find recurrence exceptions
                            var splittedId = data[i].id.split("_");
                            if(splittedId.length > 1) {
                                recurrences.push({
                                    id: splittedId[0],
                                    exception: splittedId[1]
                                });
                            }
                            parsedData.push(data[i]);
                            
                        }
            
                        //handle recurrence exceptions
                        if (recurrences.length > 0) {
                            for(var i = 0; i < recurrences.length; i++) {
                                for(var y = 0; y < parsedData.length; y++) {
                                    if(parsedData[y].id == recurrences[i].id) {
                                        if(!parsedData[y].recurrenceException) {
                                            parsedData[y].recurrenceException = recurrences[i].exception;
                                        } else {
                                            parsedData[y].recurrenceException += (";" + recurrences[i].exception);
                                        }
                    
                                    }
                                }
                            }
                        }
                        //console.log(data);
                        return data;                        
                    },
                    model: {
                        id: "id",
                        fields: {
                            id: { type: "string" },
                            title: { from: "summary", defaultValue: "No title", validation: { required: true } },
                            start: { type: "date" },
                            end: { type: "date" },
                            description: { from: "Description", defaultValue: "No title" },
                            recurrenceId: { type: "string" },
                            isAllDay: { type: "boolean", from: "IsAllDay" },
                            // attendees: { from: "attendees" },
                            // organizer: { from: "organizer" }
                        }
                    }
                }
            },
            // resources: [
            //     {
            //       field: "attendees",
            //       title: "Attendees",
            //       dataSource: [
                      
            //       ],
            //     },
            //     {
            //         field: "organizer",
            //         title: "Organizer",
            //         dataSource: [

            //         ]
            //     }
            // ]
        });
    }    
    
    $("#contacts-tab").on("click", function() {
        var synchronizeButton = document.getElementById('synchronize-button');
        gapi.client.setApiKey(apiKey);
        window.setTimeout(authorize);
        
    });

    $("#emails-tab").on("click", function(){
        $(".contact-row").remove();
    });

    /**
     *  Kendo functions
     */

    $(".kendo-table").kendoGrid({
        height: 550,
        sortable: false
    });


    $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
        }
    });

    $(".message-popup").kendoPopup({
        anchor: $('body'),
        origin: "bottom left",
        position: "top left",
        collision: "fit"
    }).data("kendoPopup").open();
    
    $(".k-animation-container").css("visibility", "hidden");
    
    $(".btn-close i").on("click", function(){
        $(".message-popup").data("kendoPopup").close();
        $('body').removeClass('hide-scroll');       
    });

    $("#events-scheduler").kendoTooltip({
        filter: "td[role='gridcell']",
        width: 300,
        content: function(e){
          var scheduler = $("#events-scheduler").getKendoScheduler();
          var slot = scheduler.slotByElement(e.target);
          var events = scheduler.occurrencesInRange(slot.startDate, slot.endDate);
          var content = "";
          for(var i=0; i < events.length; i++) {
            content = content + "<div>" + events[i].title + "</div>";
          }
          return content == "" ? "No events" : content;
        }
    });
});
