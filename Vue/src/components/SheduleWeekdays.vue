<template>
    <ol class="weekdays-container">
        <li v-for="weekday in weekdays" :key="weekday">
        {{ weekday }}
        </li>
    </ol>
</template>

<script>
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default {
	name: 'ScheduleWeekdays',
    computed: {
        weekdays() {
            return WEEKDAYS
        }
    }
}
</script>

<style scoped>

</style>
