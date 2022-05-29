<template>
	<div class="calendar-month">
		<div class="calendar-header">
			<ScheduleMonthSelector :current-date="today" :selected-date="selectedDate" @dateSelected="selectDate" />
			<ScheduleAddEvent v-bind:style="Object.keys(schedule).length === 0 || signedInUser !== viewedSchedule ? 'display: none;' : 'display: block;'" @openAdd="addingEvent = true" class="add-event"/>
		</div>
		<ScheduleWeekdays/>

		<ol class="days-grid">
			<ScheduleDay @selectEvent="updateSelectedEvent" v-for="day in days" :key="day.date" :day="day" :is-today="day.date === today" :schedule="schedule" :selectedEvent="selectedEvent" :viewedSchedule="viewedSchedule" :signedInUser="signedInUser"/>
		</ol>
		<div class="update-container" :class="!(Object.keys(selectedEvent).length === 0) ? 'on-screen' : 'off-screen'">
			<EditEvent @selectEvent="updateSelectedEvent" @updateEvent="updateEvent" @deleteEvent="deleteEvent" :event="selectedEvent" :viewedSchedule="viewedSchedule" :signedInUser="signedInUser"/>
		</div>
		<div class="add-container" :class="addingEvent ? 'on-screen' : 'off-screen'">
			<AddEvent v-if="signedInUser == viewedSchedule" @addEvent="addEvent" @closeAdd="addingEvent = false"/>
		</div>
	</div>
</template>

<script>
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import ScheduleAddEvent from "./ScheduleAddEvent.vue"
import ScheduleMonthSelector from "./SheduleMonthSelector.vue"
import ScheduleDay from "./ScheduleDay.vue"
import ScheduleWeekdays from "./SheduleWeekdays.vue"
import EditEvent from './EditEvent';
import AddEvent from './AddEvent';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

export default {
	name: 'ScheduleMain',
	components: {
		ScheduleAddEvent,
		ScheduleMonthSelector,
		ScheduleDay,
		ScheduleWeekdays,
		EditEvent,
		AddEvent
	},
	data() {
		return {
			selectedDate: dayjs(),
			selectedEvent: {},
			addingEvent: false
		};
	},
	watch: {
		selectedEvent: function() {
			if(Object.keys(this.selectedEvent).length == 0){
				document.documentElement.style.overflow = 'auto';
				return;
			}
			document.documentElement.style.overflow = 'hidden';
		},
		addingEvent: function() {
			if(this.addingEvent != true){
				document.documentElement.style.overflow = 'auto';
				return;
			}
			document.documentElement.style.overflow = 'hidden';
		}
	},
	props: {
		schedule: Object,
		activeUser: String,
		signedInUser: String,
		viewedSchedule: String
	},
	computed: {
		days() {
			return [
				...this.previousMonthDays,
				...this.currentMonthDays,
				...this.nextMonthDays
			];
		},
		today() {
			return dayjs().format("YYYY-MM-DD");
		},
		month() {
			return Number(this.selectedDate.format("M"));
		},
		year() {
			return Number(this.selectedDate.format("YYYY"));
		},
		numberOfDaysInMonth() {
			return dayjs(this.selectedDate).daysInMonth();
		},
		currentMonthDays() {
			return [...Array(this.numberOfDaysInMonth)].map((day, index) => {
				return {
					date: dayjs(`${this.year}-${this.month}-${index + 1}`).format("YYYY-MM-DD"),
					isCurrentMonth: true
				};
			});
		},
		previousMonthDays() {
			const firstDayOfTheMonthWeekday = this.getWeekday(
				this.currentMonthDays[0].date
			);
			const previousMonth = dayjs(`${this.year}-${this.month}-01`).subtract(1, "month");

			const visibleNumberOfDaysFromPreviousMonth = firstDayOfTheMonthWeekday? firstDayOfTheMonthWeekday - 1 : 6;

			const previousMonthLastMondayDayOfMonth = dayjs(this.currentMonthDays[0].date)
			.subtract(visibleNumberOfDaysFromPreviousMonth, "day")
			.date();

			return [...Array(visibleNumberOfDaysFromPreviousMonth)].map(
			(day, index) => {
				return {
					date: dayjs(
						`${previousMonth.year()}-${previousMonth.month() +
						1}-${previousMonthLastMondayDayOfMonth + index}`
						).format("YYYY-MM-DD"),
						isCurrentMonth: false
					};
				}
			);
		},
		nextMonthDays() {
			const lastDayOfTheMonthWeekday = this.getWeekday(`${this.year}-${this.month}-${this.currentMonthDays.length}`);

			const nextMonth = dayjs(`${this.year}-${this.month}-01`).add(1, "month");
			const visibleNumberOfDaysFromNextMonth = lastDayOfTheMonthWeekday ? 7 - lastDayOfTheMonthWeekday: lastDayOfTheMonthWeekday;

			return [...Array(visibleNumberOfDaysFromNextMonth)].map((day, index) => {
				return {
					date: dayjs(`${nextMonth.year()}-${nextMonth.month() + 1}-${index + 1}`).format("YYYY-MM-DD"),
					isCurrentMonth: false
				};
			});
		}
	},
	methods: {
		getWeekday(date) {
			return dayjs(date).weekday();
		},
		selectDate(newSelectedDate) {
			this.selectedDate = newSelectedDate;
		},
		updateSelectedEvent(event){
			this.selectedEvent = event;
		},
		updateEvent(event){
			this.selectedEvent = {};
			this.$emit('updateEvent', event);
		},
		deleteEvent(id){
			this.selectedEvent = {};
			this.$emit('deleteEvent', id);
		},
		addEvent(event){
			this.addingEvent = false;
			this.$emit('addEvent', event);
		}
	}
}
</script>

<style scoped>
.update-container{
	transition: all 0.55s;
	position: fixed;
	left: 0px;
	bottom: 100vh;
	width: 100vw;
	height: 100vh;
}

.add-container{
	transition: all 0.55s;
	position: fixed;
	left: 0px;
	bottom: 100vh;
	width: 100vw;
	height: 100vh;
}

.on-screen{
	bottom: 0px;
}

.off-screen{
	bottom: 100vh;
}

.calendar-header {
	display: flex;
	justify-content: space-between;
	background-color: #fff;
	padding-bottom: 40px;
	border-bottom: 1px solid #e4e4e49d !important;
}

.calendar-month {
	position: relative;
	background-color: #fff;
	padding: 35px;
}

.weekdays-container {
	text-align: center;
	font-size: 18px;
	padding-bottom: 15px;
	padding-top: 25px;
	color: rgb(87, 87, 87);
}

.weekdays-container, .days-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
}

.weekdays-container > * {
	text-align: right;
	padding-right: 5px;
}

.days-grid {
	height: 100%;
	position: relative;
	grid-column-gap: -1px;
	grid-row-gap: -1px;
}
</style>
