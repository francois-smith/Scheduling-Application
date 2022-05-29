//Francois Smith u21649988

//Parser and Builder to convert XML to JSON Bi-Directionally
xml2js = require('xml2js');
parser = new xml2js.Parser();
builder = new xml2js.Builder();

//Router that will handle server requests
var router = (app, fs) => {
    
    /**
     * Request to retrieve an entire user schedule.
     * Takes in a username paramater and sends back schedule of specified user.
     * If no schedule with passed in user exists, send back error message.
     */
    app.get('/schedule/:userName', (req, res) => {
        //If no username is passed in the return error message
        if(req.params["userName"] == null){
            res.send("No User Specified");
            return;
        }

        //Get user from request body
        let user = req.params["userName"];

        //Construct file path using passed in username
        data_file = './schedules/'+user+'.xml';

        //Attempt to read file with specified username
        fs.readFile(data_file, 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    res.send("User Does Not Exist");
                    return;
                }
                return;
            }
            
            //Otherwise parse recieved file to JSON and send back response.
            parser.parseString(data, function (err, result) {
                res.send(result);
            });           
        });
    });

    app.get('/RSS', (req, res) => {
        //Attempt to read rss feed
        fs.readFile("./RSS/feed.rss", 'utf8', (err, data) => {
            if(err){
                if(err.errno == -4058){
                    res.send("Failed to read RSS feed");
                    return;
                }
                return;
            }
            
            parser.parseString(data, function (err, result) {
                res.send(result);
            });           
        });

    });

    /**
     * Request to retrieve a n event from specific schedule.
     * Takes in a username paramater as well as eventID.
     */
    app.get('/event/:userName/:eventId', (req, res) => {
        //If no username is passed in the return error message
        if(req.params["userName"] == null){
            res.send("No User Specified");
            return;
        }

        //If no eventID is passed in the return error message
        if(req.params["eventId"] == null){
            res.send("No Event Specified");
            return;
        }

        //Get user and eventID from request body
        let user = req.params["userName"];
        let searchId = req.params["eventId"];

        //Construct file path using passed in username
        data_file = './schedules/'+user+'.xml';

        //Attempt to read file with specified username
        fs.readFile(data_file, 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    res.send("User Does Not Exist");
                    return;
                }
                return;
            }

             //Otherwise parse recieved file and save into variable
            let json;
            parser.parseString(data, function (err, result) {
                json = result;
            });   

            //Search all events from requested schedule file
            for(let event of json.schedule.event){
                //If event is found matching id specified then event was found, send back event to user
                if(event["$"].id == searchId){
                    res.json(event);  
                    return;
                }
            }

            //Otherwise if all events have been checked then event does not exist in user schedule
            res.json("Event Not Found In Schedule"); 
        });
    });

    /**
     * Request to POST an event to schedule.
     * Takes in a username paramater as well as an event object.
     */
    app.post('/event', (req, res) => {
        //If no username is passed in the return error message
        if(req.body["userName"] == null){
            res.send("No User Specified");
            return;
        }

        //If no event is passed in the return error message
        if(req.body["event"] == null){
            res.send("No Event Specified");
            return;
        }

        //Get user and event from request body
        let user = req.body["userName"];
        let event = req.body["event"];

        //Construct file path using passed in username
        data_file = './schedules/'+user+'.xml';

        //Attempt to read file with specified username.
        fs.readFile(data_file, 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    res.send("User Does Not Exist");
                    return;
                }
                return;
            }

            //Run function to validate passed in event object for minimum requirements
            let status = validateEvent(event, data);

            //If function returns anything other that "success" then the specified event is invalid
            if(status != "success"){
                //Send back response message
                res.send("ERROR ADDING EVENT: "+ status);
                return;
            }

            let jsonFile;
            parser.parseString(data, function (err, result) {
                jsonFile = result;
            }); 

            let newEvent = createEvent(req.body.event);
            if(jsonFile.schedule.event[0].$ != undefined){
                jsonFile.schedule.event.push(newEvent);
            }
            else{
                let events = {
                    "event": newEvent
                }

                jsonFile.schedule["event"] = [newEvent];
            }
            addToRSS(newEvent, user, "added");
            
            var xml = builder.buildObject(jsonFile);
            fs.writeFile(data_file, xml, (err, data) => {
                if(err){
                    //If file does not exist, then invalid user was specified
                    if(err.errno == -4058){
                        res.send("User Does Not Exist");
                        return;
                    }
                    return;
                }
                return;
            });

            res.json(jsonFile); 
        });
    });

    /**
     * Request to POST an event to schedule.
     * Takes in a username paramater as well as an event object.
     */
    app.put('/event', (req, res) => {
        //If no username is passed in the return error message
        if(req.body["userName"] == null){
            res.send("No User Specified");
            return;
        }

        //If no updated event object exists
        if(req.body["updatedEvent"] == null){
            res.send("No Updated Details Specified");
            return;
        }

        //If no eventID to be updated is passed in the return error message
        if(req.body["updatedEvent"]["id"] == null){
            res.send("No ID Specified");
            return;
        }

        //Get user and eventID from request body
        let user = req.body["userName"];
        let eventId = req.body["updatedEvent"]["id"];
        let eventDetails = req.body["updatedEvent"];

        //Construct file path using passed in username
        data_file = './schedules/'+user+'.xml';

        //Attempt to read file with specified username
        fs.readFile(data_file, 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    res.send("User Does Not Exist");
                    return;
                }
                return;
            }

            //Otherwise parse recieved file and save into variable
            let json;
            parser.parseString(data, function (err, result) {
                json = result;
            });   

            let index = 0;
            //Search all events from requested schedule file
            for(let event of json.schedule.event){
                if(event["$"].id == eventId){
                    //Run function to validate passed in event object for minimum requirements
                    let status = validateEvent(eventDetails, data, true);

                    //If function returns anything other that "success" then the specified event is invalid
                    if(status != "success"){
                        //Send back response message
                        res.send("ERROR ADDING EVENT: "+ status);
                        return;
                    }

                    let newEvent = createEvent(eventDetails);
                    json.schedule.event[index] = newEvent;
                    addToRSS(newEvent, user, "updated");

                    var xml = builder.buildObject(json);
                    fs.writeFile(data_file, xml, (err, data) => {
                        if(err){
                            //If file does not exist, then invalid user was specified
                            if(err.errno == -4058){
                                res.send("User Does Not Exist");
                                return;
                            }
                            return;
                        }
                        return;
                    });

                    res.json(json);
                    return;
                }
                index++;
            }

            //Otherwise if all events have been checked then event does not exist in user schedule
            res.json("Event Not Found In Schedule"); 
        });
    });

    /**
     * Request to POST an event to schedule.
     * Takes in a username paramater as well as an event object.
     */
    app.delete('/event', (req, res) => {
        //If no username is passed in the return error message
        if(req.body["userName"] == null){
            res.send("No User Specified");
            return;
        }

        //If no eventID is passed in the return error message
        if(req.body["eventId"] == null){
            res.send("No Event Specified");
            return;
        }

        //Get user and eventID from request body
        let user = req.body["userName"];
        let searchId = req.body["eventId"];

        //Construct file path using passed in username
        data_file = './schedules/'+user+'.xml';

        //Attempt to read file with specified username
        fs.readFile(data_file, 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    res.send("User Does Not Exist");
                    return;
                }
                return;
            }

            //Otherwise parse recieved file and save into variable
            let json;
            parser.parseString(data, function (err, result) {
                json = result;
            });   

            let index = 0;
            //Search all events from requested schedule file
            for(let event of json.schedule.event){
                //If event is found matching id specified then event was found, send back event to user
                if(event["$"].id == searchId){
                    json.schedule.event.splice(index, 1);
                    if(json.schedule.event.length == 0){
                        json.schedule.event.push({});
                    }

                    addToRSS(event, user, "removed");

                    var xml = builder.buildObject(json);
                    fs.writeFile(data_file, xml, (err, data) => {
                        if(err){
                            //If file does not exist, then invalid user was specified
                            if(err.errno == -4058){
                                res.send("User Does Not Exist");
                                return;
                            }
                            return;
                        }
                        return;
                    });

                    res.json(json);
                    return;
                }
                index++;
            }

            //Otherwise if all events have been checked then event does not exist in user schedule
            res.json("Event Not Found In Schedule"); 
        });
    });

    /**
     * Function to validate an event object for minimum requirements.
     * Takes in a event(data) and a schedule object.
     * If any of the minimum requirements are not met, send back a response message.
     * Event is structured on client side before being posted, thus it asumed events are correct.
     * These are basic checks of only the necessities.
     */
    function validateEvent(event, schedule, put = false){
        //First check if ID is specified, it asumed that id is generated and valid on client side.
        if(event.id == undefined){
            return "ID not set";
        }
        //Second check to see if ID is correct length, again client will format ID
        if(event.id.length != 9){
            return "Invalid ID specified";
        }
    
        if(put == false){
            //Variable used to hold return value from function below.
            let returnMessage = "";
            //Parse the passed in schedule and see if event with ID already exists in schedule
            parser.parseString(schedule, function (err, result) {
                if(result.schedule.event != null){
                    for(let existingEvent of result.schedule.event){
                        if(existingEvent.id !== undefined && event.id == existingEvent["$"].id){
                            returnMessage = "ID already exists";
                        }
                    }
                }
            });
    
            //If event was found with new event ID 
            if(returnMessage != "") return returnMessage;
        }
    
    
        //If no title is specified
        if(event.title == undefined){
            return "Title not set";
        }
        //Second smaller check to see if title is too long, client side will do validation too
        if(event.title.length > 25){
    
        }
    
        //Array of valid event types
        let types = ["Event", "Task", "Appointment"];
        //Check if new event type is set and equal to one of the 3 values
        if(event.type == undefined || types.indexOf(event.type) == -1){
            return "Type not set";
        }
    
        //Check if date object exists within event
        if(event.date == undefined){
            return "Date not set";
        }
    
        //If repeat is defines, check if it is a valid value
        let repeat = ["Daily", "Weekly", "Monthly"];
        if(event.date.repeat != undefined){
            if(repeat.indexOf(event.date.repeat) == -1){
                return "Invalid repeat";
            }
        }
    
        //Check if date has a day value
        if(event.date.day == undefined){
            return "Date day not set";
        }
        //Check if valid day is specified and it does not go out of bounds
        if(event.date.day > 31 || event.date.day < 0){
            return "Invalid date day set";
        }
    
        //Check if event has month set within date object
        if(event.date.month == undefined){
            return "Date month not set";
        }
        //Array of months of year, used to validate if new event month is valid
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if(months.indexOf(event.date.month) == -1){
            return "Invalid date month set";
        }
    
        //Check if event has guests object(can be empty)
        if(event.guests == undefined){
            return "Guests not set";
        }
        else{
            //Checks if guests exist within guests object and if they do validate them, otherwise if guests are empty then continue
            if(event.guests.length != 0){
                if(event.guests[0].guest.length > 10){
                    return "Too many guests";
                }
    
                //If number of guests is fine, loop through every guest and validate them
                for(let guest of event.guests[0].guest){
                    //If guest does not have email or name defined then they are invalid
                    if(guest.name == undefined && guest.email == undefined){
                        return "Invalid guest in list";
                    }
    
                    //Check if name is correct length if it is defined
                    if(guest.name != undefined && guest.name.length > 50){
                        return "Invalid guest in list";
                    }
    
                    //Check if email is correct length if it is defined
                    if(guest.email != undefined && guest.email.length > 50){
                        return "Invalid guest in list";
                    }
                }
            }
        }
    
        //If all checks pass then it is assumed that event is correct
        return "success";
    }

    /**
     * Function to add a new event to the rss feed.
     * Takes in a @param event => event that was altered
     * Takes in a @param user => User who Initiated the change
     * Takes in a @param status => what action was performed on the event
     */
    function addToRSS(event, user, status){
        //Attempt to read file with specified username.
        fs.readFile("./RSS/feed.rss", 'utf8', (err, data) => {
            if(err){
                //If file does not exist, then invalid user was specified
                if(err.errno == -4058){
                    console.log("Could Not Read RSS");
                    return;
                }
                return;
            }

            let jsonFile;
            parser.parseString(data, function (err, result) {
                jsonFile = result;
            }); 

            event.$["status"] = status;
            event.$["user"] = user;
            if(jsonFile.feed.event.length == 5){
                jsonFile.feed.event.pop();
                jsonFile.feed.event.unshift(event);
            }
            else{
                jsonFile.feed.event.unshift(event);
            }
            
            var xml = builder.buildObject(jsonFile);
            fs.writeFile("./RSS/feed.rss", xml, (err, data) => {
                if(err){
                    //If file does not exist, then invalid user was specified
                    if(err.errno == -4058){
                        console.log("Could Not Read RSS");
                    }
                }
            });
        });
    }
    
    /*
     * Function that takes in a event and converts it into a xml buildable object.
     * It is asumed that event passed is adheres to basic rules of the schema.
     * Only gets called after basic checks are validated.
     */
    function createEvent(data){
        //Extract basic information from event
        let id = data.id;
        let title = data.title;
        let type = data.type;
        let guests = data.guests;

        //Create new date object and populate it with data to match needed structure
        let date = {};

        //get date that was POSTED
        let extractedDate = data.date;

        //First set attribute if it exists, to retain order
        if(extractedDate.repeat != undefined){
            date["$"] = { "repeat": extractedDate.repeat}
        }

        //Because these 2 are needed just extract them
        date["day"] = [ extractedDate.day.toString() ];
        date["month"] = [ extractedDate.month ];

        //If optional parameters are defined addthem to object
        if(extractedDate.startingTime != undefined){
            date["startingTime"] = [ extractedDate.startingTime ];
        }
        if(extractedDate.endingTime != undefined){
            date["endingTime"] = [ extractedDate.endingTime ];
        }

        //Create object with base information, asumed that all of these have validated and is set
        let returnObject = {
            '$': { "id": id },
            "title": [ title ],
            "type": [ type ],
            "date": [ date ],
            "guests": guests,
        }

        //Last 2 optional paramaters, if they are set append them
        if(data.venue != undefined){
            returnObject["venue"] = [ data.venue ];
        }
        if(data.description != undefined){
            returnObject["description"] = [ data.description ];
        }

        return returnObject;
    }
}

module.exports = router;