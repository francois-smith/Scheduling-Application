<template>
	<!-- Francois Smith u21649988 -->
	<li id="event_attachment" class="calendar-day" :class="{'prev-month': !day.isCurrentMonth, 'calendar-today': isToday}">
		<div class="events-container" v-if="!(Object.keys(schedule).length === 0) && schedule.schedule.event.length != 0">
			<template v-for="event in getSchedule">
				<div v-on:click="selectEvent(event.$.id.toString())" :key="event" class="event" v-if="event.date && event.date[0].day.toString() == getDay && event.date[0].month.toString() == getMonth">
					<span>{{event.title.toString()}}</span>
				</div>
			</template>
		</div>
		<span class="day">{{ label }}</span>
	</li>
</template>



<script>
import dayjs from "dayjs";
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default {
	name: "SheduleDay",
	props: {
		day: {
			type: Object,
			required: true
		},
		isCurrentMonth: {
			type: Boolean,
			default: false
		},
		isToday: {
			type: Boolean,
			default: false
		},
		schedule: Object,
		selectedEvent: Object,
	},
	computed: {
		label() {
			return dayjs(this.day.date).format("D");
		},
		getDay() {
			return dayjs(this.day.date).format("D");
		},
		getMonth() {
			return months[dayjs(this.day.date).format("M")-1];
		},
		getSchedule() {
			for(let event of document.querySelectorAll(".event")){
				event.style.backgroundColor = this.randomColor();
			}
			return this.schedule.schedule.event;
		}
	},
	methods: {
		selectEvent: function(event){
			let schedule = JSON.parse(JSON.stringify(this.schedule)).schedule.$.user.replace(/ /g,'');
			fetch("http://localhost:3000/event/"+schedule+"/"+event)
			.then(async response => {
				let data;
				try {
					data = await response.json();
				} catch (e) {
					this.selectEvent = {};
					return;
				}
				this.$emit('selectEvent', data);
			});
		},
		randomColor: function(){
			let colors = ['#f3b687', '#d2a7e8', '#5d9ca4', '#bcc199', '#f5d5cb', '#869bae', '#a99282', '#dba9b7'];
			return colors[Math.floor(Math.random()*colors.length)];
		}
	}
};
</script>

<style scoped>
.event{
	color: #fff;
	padding: 5px 8px;
	border-radius: 4px;
	cursor: pointer;
	position: relative;
	margin-bottom: 3px;
}

.event:hover{
	filter: brightness(0.9);
}

.calendar-day {
	position: relative;
	height: 150px;
	font-size: 16px;
	background-color: #fff;
	color: rgb(95, 95, 95);
	border: 1px solid #e4e4e49d !important;
	padding: 5px;
	overflow-y: scroll;
}

.day {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 10px;
	top: 130px;
	width: 20px;
	height: 20px;
}

.prev-month {
	background-image: repeating-linear-gradient(50deg, 
    rgba(238, 238, 238, 0.658) 10px,
    rgba(238, 238, 238, 0.658) 12px,
    transparent 12px,
    transparent 20px);
	color: rgb(102, 102, 102);
}

.calendar-today > span {
	color: #fff;
	padding: 7px;
	border-radius: 5px;
	top: 120px;
	background-color: var(--color-dark-accent);
}
</style>