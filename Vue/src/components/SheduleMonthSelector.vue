<template>
	<!-- Francois Smith u21649988 -->
	<div class="calendar-date-selector">
		<img class="button-left" @click="selectPrevious" src="../media/angle.svg">
		<div class="current-month">
			<img src="../media/calendar.svg">
			<span>{{ selectedMonth }}</span>
		</div>
		<img class="button-right" @click="selectNext" src="../media/angle.svg">
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
	name: 'ScheduleMonthSelector',
	props: {
		selectedDate: {
			type: Object,
			required: true
		}
	},
	computed: {
		selectedMonth() {
			return this.selectedDate.format("MMMM YYYY");
		}
	},
	methods: {
		selectPrevious() {
			let newSelectedDate = dayjs(this.selectedDate).subtract(1, "month");
			this.$emit("dateSelected", newSelectedDate);
		},
		selectNext() {
			let newSelectedDate = dayjs(this.selectedDate).add(1, "month");
			this.$emit("dateSelected", newSelectedDate);
		}
	}
}
</script>

<style scoped>
.button-right{
	border: 1px solid #e4e4e49d !important;
	width: 11px;
	padding: 8px 12px;
	transform: scaleX(-1);
	cursor: pointer;
	user-select: none;
	border-radius: 6px 0px 0px 6px;
}

.button-right:hover, .button-left:hover{
	background-color: rgb(226, 226, 226);
}

.button-left{
	border: 1px solid #e4e4e49d !important;
	padding: 8px 12px;
	width: 11px;
	cursor: pointer;
	user-select: none;
	border-radius: 6px 0px 0px 6px;
}

.current-month{
	font-size: 18px;
	display: flex;
	padding: 8px 12px;
	align-items: center;
	border: 1px solid #e4e4e49d !important;
	margin: 0px -1px;
}
.current-month span{
	padding-left: 10px;
	font-weight: 500;
}

.current-month img{
	width: 25px;
}

.calendar-date-selector {
	display: flex;
	color: rgb(65, 65, 65);
}
</style>
