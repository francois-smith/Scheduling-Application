<template>
	<!-- Francois Smith u21649988 -->
	<div id="main-container">
		<div id="sidebar">
			<div id="user-container">
				<img id="user-icon" src="./media/user.png">
				<span id="signed-in-as">Signed in as</span>
				<select v-model="signedInUser" @change="updateWidth($event)">
					<option>DaddyLongLegs</option>
					<option>John Travolta</option>
					<option>Michael Jordan</option>
					<option>Yeet Skadeet</option>
					<option>Jeff</option>
				</select>
			</div>
			<h2 id="schedules-title">Schedules</h2>
			<div class="user-calendar" v-on:click="loadCalendar($event, 'DaddyLongLegs')">
				DaddyLongLegs
			</div>
			<div class="user-calendar" v-on:click="loadCalendar($event, 'JohnTravolta')">
				John Travolta
			</div>
			<div class="user-calendar" v-on:click="loadCalendar($event, 'MichaelJordan')">
				Michael Jordan
			</div>
			<div class="user-calendar" v-on:click="loadCalendar($event, 'YeetSkadeet')">
				Yeet Skadeet
			</div>
			<div class="user-calendar" v-on:click="loadCalendar($event, 'Jeff')">
				Jeff
			</div>
			<div id="rss-feed">
				<h2 id="rss-feed-title">RSS Feed</h2>
				<hr/>

				<div class="feed-item" v-for="item in feed.event" :key="item">
					<div class="feed-item-details">
						<span class="feed-user">{{item.$.user.replace(/([A-Z])/g, ' $1').trim()}}</span>
						<div class="feed-details">
							<span v-if="item.$.status == 'updated'" class="updated feed-detail">Updated</span>
							<span v-if="item.$.status == 'added'" class="added feed-detail">Added</span>
							<span v-if="item.$.status == 'removed'" class="removed feed-detail">Removed</span>
							<span> an event</span>
						</div>
					</div>
					<img v-if="item.$.status == 'updated'" src="./media/edit.svg">
					<img v-if="item.$.status == 'added'" src="./media/add2.svg">
					<img v-if="item.$.status == 'removed'" src="./media/delete2.svg">
				</div>
			</div>
		</div>
		<div id="schedule-container">
			<div id="schedule-header">
				<h2>{{activeUser}}</h2>
			</div>
		<ScheduleMain @deleteEvent="deleteEvent" @updateEvent="updateEvent" @addEvent="addEvent" :schedule="activeSchedule" :viewedSchedule="viewedSchedule" :signedInUser="signedInUser"/>
		</div>
	</div>
</template>

<script>
import ScheduleMain from './components/Schedule.vue'
import { useToast } from "vue-toastification";

export default {
	name: 'App',
	components: {
		ScheduleMain
	},
	setup() {
      const toast = useToast();
      return { toast }
    },
	mounted() {
		this.updateRSS();
	},
	data(){
		return {
			activeSchedule: {},
			activeUser: "No Active Schedule",
			viewedSchedule: "none",
			signedInUser: "DaddyLongLegs",
			feed: {}
		}
	},
	methods: {
		updateWidth(event){
			let tempSelect = document.createElement('select'),
			tempOption = document.createElement('option');

			tempOption.textContent = event.target.options[event.target.selectedIndex].text;
			tempSelect.style.cssText += `
				visibility: hidden;
				position: fixed;
				`;
			tempSelect.appendChild(tempOption);
			event.target.after(tempSelect);
			
			const tempSelectWidth = tempSelect.getBoundingClientRect().width-10;
			event.target.style.width = `${tempSelectWidth}px`;
			tempSelect.remove();
		},
		loadCalendar: function(event, name){
			let calendars = document.getElementsByClassName("user-calendar");
			for(let calendar of calendars){
				calendar.classList.remove("active-calendar");
			}
			event.target.classList.add("active-calendar");
			
			fetch("http://localhost:3000/schedule/"+name)
			.then(async response => {
				let data;
				try {
					data = await response.json();
				} catch (e) {
					this.activeSchedule = {}
					this.activeUser = "Shedule Not Found"
					return;
				}
				this.activeUser = data.schedule.$.user;
				this.activeUser += "'s Schedule";
				this.activeSchedule = data;
				this.viewedSchedule = data.schedule.$.user;
			});
		},
		deleteEvent(event){
			let userSchedule = JSON.parse(JSON.stringify(this.activeSchedule)).schedule.$.user.replace(/ /g,'');
			let eventId = event;
			const requestOptions = {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ "userName": userSchedule, "eventId": eventId.toString()})
			};

			fetch("http://localhost:3000/event", requestOptions)
			.then(async response => {
				let data = await response.json();
				this.activeUser = data.schedule.$.user;
				this.activeUser += "'s Schedule";
				this.activeSchedule = data;
				this.viewedSchedule = data.schedule.$.user;
				this.popup("Event successfully deleted");
				this.updateRSS();
			});
		},
		updateEvent(event){
			let userSchedule = JSON.parse(JSON.stringify(this.activeSchedule)).schedule.$.user.replace(/ /g,'');
			let request = {
				"userName": userSchedule,
				"updatedEvent": event
			}
			const requestOptions = {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request)
			};

			fetch("http://localhost:3000/event", requestOptions)
			.then(async response => {
				let data = await response.json();
				this.activeUser = data.schedule.$.user;
				this.activeUser += "'s Schedule";
				this.activeSchedule = data;
				this.viewedSchedule = data.schedule.$.user;
				this.popup("Event successfully updated");
				this.updateRSS();
			});
		},
		addEvent(event){
			let userSchedule = JSON.parse(JSON.stringify(this.activeSchedule)).schedule.$.user.replace(/ /g,'');
			let request = {
				"userName": userSchedule,
				"event": event
			}
			const requestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request)
			};

			fetch("http://localhost:3000/event", requestOptions)
			.then(async response => {
				let data = await response.json();
				this.activeUser = data.schedule.$.user;
				this.activeUser += "'s Schedule";
				this.activeSchedule = data;
				this.viewedSchedule = data.schedule.$.user;
				this.popup("Event successfully added");
				this.updateRSS();
			});
		},
		updateRSS(){
			fetch("http://localhost:3000/RSS")
			.then(async response => {
				let data = await response.json();
				this.feed = data.feed;
				console.log(JSON.parse(JSON.stringify(this.feed)));
			});
		},
        popup(message){
            this.toast.success(message, {
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

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito');

#main-container{
	display: grid;
	grid-template-columns: 250px 1fr;
	grid-template-rows: 1fr;
	height:100vh;
}

#sidebar{
	grid-area: 1 / 1 / 2 / 2;
	border: 1px solid #e4e4e4 !important;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 50px;
	position: relative;
}

#user-icon{
	width: 75px;
	padding-bottom: 25px;
}

#signed-in-as{
	font-size: 14px;
}

#sidebar select{
	padding: 6px;
	font-size: 16px;
	border: none;
	background-color: #fff;
}

#user-container{
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 80%;
	padding-bottom: 50px;
}

#schedules-title{
	color: #555;
	font-size: 24px;
	font-weight: 500;
	text-align: center;
	padding-bottom: 14px;
	border-bottom: 1px solid #e4e4e49d !important;
	width: 80%;
}

.user-calendar{
	text-align: center;
	cursor: pointer;
	width: 80%;
	padding: 10px 0px;
	border-bottom: 1px solid #e4e4e49d !important;
}

.user-calendar:hover{
	background-color: rgb(226, 226, 226);
	width: 100%;
}

.active-calendar{
	background-color: var(--color-dark-accent) !important;
	color: #fff;
	width: 100%;
}

#rss-feed{
	padding: 50px 0px;
	width: 80%;
}

#rss-feed-title + hr{
	border: 0;
    height: 1px;
    background: #333;
    background-image: linear-gradient(to right, #ccc, #333, #ccc);
    margin-bottom: 15px;
}

#rss-feed-title{
	color: #555;
	font-size: 24px;
	font-weight: 500;
	text-align: center;
	padding-bottom: 10px;
}

.feed-item-details{
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.feed-item{
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px;
	margin-bottom: 12px;
	transition: all 0.3s;
}

.feed-item *{
	cursor: default;
}

.feed-item:hover{
	transform: translateX(10px);
}

.feed-user{
	font-size: 19px
}

.feed-item img{
	height: 25px;
}

.feed-details{
	display: flex;
	align-items: center;
}

.feed-detail{
	padding: 3px 5px;
	color: #fff;
	border-radius: 5px;
	margin-right: 4px;
}

.updated{
	background-color: #ce9739;
}

.added{
	background-color: #6da06f;
}

.removed{
	background-color: #c13525;
}

#schedule-container{
	grid-area: 1 / 2 / 2 / 3;
	padding: 40px;
	background-color: #f5f5f5cb;
}

#schedule-container h2{
	padding-bottom: 35px;
	font-weight: 500;
	font-size: 28px;
}

*{
	margin: 0px;
	padding:  0px;
}

#app {
	font-family: "Nunito", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	
	color: #2c3e50;
}

body {
	--color-dark: #363638;
	--color-gray: #8d8c8a;
	--color-light: #f6f6f6;
	--color-dark-accent: #55b0f2;
	--color-accent: #55b0f2;
}

ol, li {
	padding: 0;
	margin: 0;
	list-style: none;
}
</style>
