<template>
    <div id="event-container">
        <div id="view-header">
            <input minlength="3" placeholder="Title" v-model="title">
            <img @click="closeView" src="../media/close.svg">
        </div>
        <div id="view-body">
            <span id="view-type-title">Event Type: </span>
            <div id="view-type">
                <label><input type="radio" name="eventType" value="Event" v-on:change="updateType('Event')" :checked="type == 'Event'"> Event</label>
                <label><input type="radio" name="eventType" value="Task" v-on:change="updateType('Task')" :checked="type == 'Task'"> Task</label>
                <label><input type="radio" name="eventType" value="Appointment" v-on:change="updateType('Appointment')" :checked="type == 'Appointment'"> Appointment</label>
            </div>

            <div id="view-date">
                <MonthPicker @change="changeMonth" :show-year="false" :default-month="getMonth"/>
                <div id="view-date-time">
                    <label>
                        Day: <input id="date-number" v-model="day" type="number" min="1" :max='getMaxDays'>
                    </label>
                    <label>From:&nbsp;
                        <date-picker :value="getStartTime"
                        :time-picker-options="{
                            start: '06:00',
                            step: '00:30',
                            end: '22:00',
                        }" format="hh:mm a" v-on:change="startingChange" type="time" placeholder="hh:mm a"/>
                    </label>
                    <label>To:&nbsp;
                        <date-picker :value="getEndTime"
                        :time-picker-options="{
                            start: '06:00',
                            step: '00:30',
                            end: '22:00',
                        }" format="hh:mm a" v-on:change="endingChange" type="time" placeholder="hh:mm a"></date-picker>
                    </label>
                </div>
            </div>

            <span id="view-repeat-title">Repeat: </span>
            <div id="view-repeat">
                <label><input type="checkbox" class="repeatOption" @change="check($event)" value="Daily" :checked="repeatType == 'Daily'"> Daily</label>
                <label><input type="checkbox" class="repeatOption" @change="check($event)" value="Weekly" :checked="repeatType == 'Weekly'"> Weekly</label>
                <label><input type="checkbox" class="repeatOption" @change="check($event)" value="Monthly" :checked="repeatType == 'Monthly'"> Monthly</label>
            </div>

            <span id="view-venue-title">Venue: </span>
            <div id="view-venue">
                <input type="text" v-model="venue"/>
            </div>

            <span id="view-description-title">Description: </span>
            <div id="view-description">
                <textarea v-model="description"></textarea>
            </div>

            <div id="view-guests">
                <hr/>
                <h3>Guest List</h3>
                <div class="view-guest" v-for="(guest, index) in guestlist" :key="index">
                    <input type="text" placeholder="example@email.com" v-model="guestlist[index].name">
                    <input type="text" placeholder="name" class="email-input" v-model="guestlist[index].email">
                    <img @click="removeGuest(index)" src="../media/remove.svg">
                </div>
                <button id="addGuest" @click="addGuest()" v-bind:style="guestlist.length >= 10 ? 'display: none;' : 'display: flex;'"><img src="../media/add.svg"><span>Add Guest</span></button>
            </div>
        </div>
        <div id="view-button">
            <button @click="addEvent" id="view-button-add"><img src="../media/add.svg"><span class="view-button-title">Add Event</span></button>
        </div>
    </div>
</template>

<script>
import { MonthPicker } from 'vue-month-picker'
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';
import moment from 'moment'
import { useToast } from "vue-toastification";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default {
	name: 'EventAdd',
    components: {
        MonthPicker,
        DatePicker
    },
    setup() {
        const toast = useToast();
        return { toast }
    },
    data() {
        return {
            title: "",
            type: "Event",
            startTime: "hh:mm a",
            endTime: "hh:mm a",
            day: 1,
            month: "January",
            description: "",
            venue: "",
            repeatType: "",
            guestlist: []
        };
    },
    computed: {
        getMonth(){
            let month = this.month;
            return months.indexOf(month, 0)+1;
        },
        getMaxDays(){
            let month = this.month;
            return days[months.indexOf(month, 0)];
        },
        getStartTime(){
            let start = this.startTime;
            if(start == "hh:mm a"){
                return "hh:mm a";
            }
            let m = moment("19/03/2022 "+start, "DD/MM/YYYY hh:mm a");
            return m.toDate();    
        },
        getEndTime(){
            let end = this.endTime;
            if(end == "hh:mm a"){
                return "hh:mm a";
            }
            let m = moment("19/03/2022 "+end, "DD/MM/YYYY hh:mm a");
            return m.toDate();    
        }
    },
    methods: {
		startingChange: function(value){
            if(value == null){
                this.startTime = "hh:mm a";
                return;
            }
            else{
                const str = value.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
                this.startTime = str;
            }
        },
        endingChange: function(value){
            if(value == null){
                this.endTime = "hh:mm a";
                return;
            }
            else{
                const str = value.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
                this.endTime = str;
            }
        },
        closeView: function(){
            this.title = "";
            this.type = "Event";
            this.startTime = "hh:mm a";
            this.endTime = "hh:mm a";
            this.day = 1;
            this.month = "January";
            this.description = "";
            this.venue = "";
            this.repeatType = "";
            this.guestlist = [];
            this.$emit('closeAdd');
        },
        check: function(event){
            if(event.target.checked){
                this.repeatType = event.target.value;
            }
            else{
                this.repeatType = "";
            }
        },
        updateType(type){
            this.type = type;
        },
        changeMonth(date){
            this.month = months[date.monthIndex-1];
        },
        removeGuest(index){
            let newList = JSON.parse(JSON.stringify(this.guestlist));
            newList.splice(index, 1);
            this.guestlist = newList;
        },
        addGuest(){
            let updatedList = JSON.parse(JSON.stringify(this.guestlist));
            let newUser = { 
                "email": "",
                "name": ""
            }
            updatedList.push(newUser);
            this.guestlist = updatedList;
        },
        addEvent(){
            let newEvent = {
                title: this.title,
                type: this.type,
                "date":{
                    "day": this.day,
                    "month": this.month
                },
            }

            if(newEvent.title === ""){
                this.throwError("Please Enter a Valid Title");
                return;
            }

            if(newEvent.title.length < 5){
                this.throwError("Title Field Is Too Short");
                return;
            }

            let month = this.month;
            let max = days[months.indexOf(month, 0)];
            if(newEvent.date.day === "" || newEvent.date.day < 1 || newEvent.date.day > max){
                this.throwError("Please Select a Valid Day");
                return;
            }
            //sets optional values if they are assigned
            if(this.repeatType != ""){
                newEvent.date["repeat"] = this.repeatType;
            }
            if(this.startTime != "hh:mm a"){
                newEvent.date["startingTime"] = this.startTime;
            }
            if(this.endTime != "hh:mm a"){
                newEvent.date["endingTime"] = this.endTime;
            }
            if(this.venue != ""){
                newEvent["venue"] = this.venue;
            }
            if(this.description != ""){
                newEvent["description"] = this.description;
            }

            if(this.guestlist.length > 0){
                let guests = JSON.parse(JSON.stringify(this.guestlist));
                let i = 1;
                let guestlist = [];
                for(let guest of guests){
                    if(guest.name === "" && guest.email === ""){
                        this.throwError("Guest #"+i+" need to have a name or email assigned");
                        return;
                    }
                    else{
                        guestlist.push({ "name": guest.name.toString(), "email": guest.email.toString()});
                    }
                    i++;
                }
                newEvent["guests"] = [{"guest": guestlist}];
            }
            else{
                newEvent["guests"] = [];
            }

            let titleExtract = newEvent.title.replace(/ /g,'').substring(0, 3);
            let id = titleExtract + Math.random().toString(36).substring(2, 6) + newEvent.date.day.toString().substring(0, 1) + newEvent.date.month.toString().substring(0, 1);
            
            newEvent["id"] = id;

            this.title = "";
            this.type = "Event";
            this.startTime = "hh:mm a";
            this.endTime = "hh:mm a";
            this.day = 1;
            this.month = "January";
            this.description = "";
            this.venue = "";
            this.repeatType = "";
            this.guestlist = [];
            this.$emit('addEvent', newEvent);
        },
        throwError(error){
            this.toast.error(error, {
                position: "top-center",
                timeout: 3000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: true,
                hideProgressBar: true,
                closeButton: "button",
                icon: false,
                rtl: false
            });
        }
    }
}

</script>

<style scoped>
#event-container{
    left: 50%;
    top: 50%;
    width: 500px;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    position: relative;
    transform: translate(-50%, -50%);
    border-radius: 12px;
    position: relative;
}

#view-header input{
    padding: 6px;
    font-size: 26px;
    font-weight: 400;
    width: 90%;
    border: none;
    color: #fff;
    background-color: var(--color-accent);
}

#view-header input:focus{
    outline: none;
}

#view-header img{
    cursor: pointer;
}

#view-header{
    background-color: var(--color-accent);
    border-radius: 12px 12px 0px 0px;
    padding: 8px;
}

#view-body{
    height: 600px;
    overflow-y: scroll;
    display: grid;
    grid-template-columns: 120px 1fr;
    grid-template-rows: 40px 1fr 40px 40px 150px auto;
    background-color: #f5f5f5;
    padding: 25px;
}

label{
    color: rgb(136, 136, 136);
    position: relative;
    padding-right: 10px;
}

#view-type-title{
    grid-area: 1 / 1 / 2 / 2;
    color: rgb(136, 136, 136);
}
#view-type{
    grid-area: 1 / 2 / 2 / 3;
}
#view-type input{
    margin-left: 15px;
}

#view-date{
    grid-area: 2 / 1 / 3 / 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 20px;
    justify-content: center;
    position: relative;
}
#view-date-time{
    display: flex;
    align-items: center;
    padding-top: 20px;
    justify-content: space-around;
    width: 100%;
    position: relative;
}
#date-number{
    display: inline-block;
    box-sizing: border-box;
    width: 60px;
    height: 34px;
    padding: 6px;
    font-size: 14px;
    line-height: 1.4;
    color: #555;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top-color: rgb(204, 204, 204);
    border-right-color: rgb(204, 204, 204);
    border-bottom-color: rgb(204, 204, 204);
    border-left-color: rgb(204, 204, 204);
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
}

#view-repeat-title{
    padding-top: 5px;
    grid-area: 3 / 1 / 4 / 2;
    color: rgb(136, 136, 136);
}
#view-repeat{
    grid-area: 3 / 2 / 4 / 3;
    margin-left: 15px;
}

#view-venue-title{
    padding-top: 5px;
    grid-area: 4 / 1 / 5 / 2;
    color: rgb(136, 136, 136);
}
#view-venue{
    grid-area: 4 / 2 / 5 / 3;
    margin-left: 15px;
}
#view-venue input{
    width: 90%;
    display: inline-block;
    box-sizing: border-box;
    padding: 6px;
    font-size: 14px;
    line-height: 1.4;
    color: #555;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top-color: rgb(204, 204, 204);
    border-right-color: rgb(204, 204, 204);
    border-bottom-color: rgb(204, 204, 204);
    border-left-color: rgb(204, 204, 204);
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
}

#view-description-title{
    padding-top: 5px;
    grid-area: 5 / 1 / 6 / 2;
    color: rgb(136, 136, 136);
}
#view-description{
    grid-area: 5 / 2 / 6 / 3;
    margin-left: 15px;
}
#view-description textarea{
    width: 90%;
    height: 150px;
    display: inline-block;
    box-sizing: border-box;
    padding: 6px;
    font-size: 14px;
    line-height: 1.4;
    color: #555;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top-color: rgb(204, 204, 204);
    border-right-color: rgb(204, 204, 204);
    border-bottom-color: rgb(204, 204, 204);
    border-left-color: rgb(204, 204, 204);
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    resize: none
}

#view-guests{
    grid-area: 6 / 1 / 7 / 3;
    margin-top: 20px;
}
#view-guests hr{
    border: 0;
    height: 1px;
    background: #333;
    background-image: linear-gradient(to right, #ccc, #333, #ccc);
    margin-bottom: 15px;
}
#view-guests h3{
    text-align: center;
    color: #555;
}
.view-guest{
    display: flex;
    align-items: center;
    width: 100%;
    background-color: rgb(255, 255, 255);
    margin-top: 5px;
    border-radius: 5px;
    padding: 4px;
}
.view-guest img{
    height: 80%;
    padding-left: 10px;
    cursor: pointer;
}
.email-input{
    border-left: 2px solid #555 ! important;
}
.view-guest input{
    width: 42%;
    background-color: #fff;
    border: none;
    padding: 6px;
    font-size: 16px;
    line-height: 1.4;
    color: #555;
}
.view-guest input:focus{
    outline: none;
}
#addGuest{
    width: 100%;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: #fff;
    padding: 5px;
    font-size: 20px;
    border-radius: 5px;
    cursor: pointer;
    background-color: var(--color-accent);
    color: #fff;
    margin-top: 10px;
}
#addGuest:hover{
    filter: brightness(0.9);
}
#addGuest img{
    width: 25px;
    padding-right: 10px;
}

.mx-datepicker {
    width: 110px !important;
}

#view-button{
    display: flex;
    width: 100%;
    justify-content: center;
    padding: 20px 0px;
}
#view-button button{
    margin: 0px 15px;
    padding: 10px 14px;
    border: none;
    border-radius: 10px;
    display: flex;
    cursor: pointer;
    display: flex;
    align-items: center;
}

#view-button button img{
    padding-right: 5px;
    height: 25px;
}
.view-button-title{
    font-size: 16px;
    font-weight: 200;
    color: #fff;
}
#view-button-add{
    background-color: rgb(43, 177, 87);
}
</style>
