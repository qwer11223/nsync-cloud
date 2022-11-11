<template>
	<div class="select-container">
		<div class="select-all">
			<span
				class="boxout"
				:class="{'activate-border':select}"
				:style="{'border-color':select?activate:inactive}"
			>
				<span
					class="boxin"
					:class="{activate:select}"
					:style="{'background-color':select?activate:'transparent'}"
				></span>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'CheckBox',
	data() {
		return {
			activate: '#0099ff',
			inactive: '#cfcfcf',
			selected: false
		}
	},
	computed: {
		select() {
			return this.selected
		}
	}
}
</script>

<style lang="scss" scoped>
$color: '#0099ff';

.select-container {
	//position: absolute;
	display: flex;
	//width: 80px;
	justify-content: space-between;
	align-items: center;
	margin: 0 15px;

	.select-all {
		display: flex;
		align-items: center;
		cursor: pointer;
		//padding: 4px;
		&:hover .boxout {
			border-color: $color;
		}

		.boxout {
			position: relative;
			display: inline-block;
			border: 1px solid #cfcfcf;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			transition: 0.2s;

			.boxin {
				display: inline-block;
				position: absolute;
				width: 8px;
				height: 8px;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				border-radius: 50%;
				transition: 0.2s;
			}
		}
	}
}
</style>