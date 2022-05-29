<template>
	<div @click="openMenu" class="add-event-button">
		<span>+ Add Event</span>
	</div>
</template>

<script>
export default {
	name: 'ScheduleAddEvent',
	methods: {
		openMenu(){
			this.$emit('openAdd');
		}
	}
}
</script>


<style scoped>
	.add-event-button{
		background-color: var(--color-dark-accent);
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 12px;
		border-radius: 4px;
		cursor: pointer;
	}
	.add-event-button:hover{
		filter: brightness(0.9);
	}
	.hidden{
		display: none;
	}
</style>
