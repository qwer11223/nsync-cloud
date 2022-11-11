<template>
	<div class="setting-container">
		<div class="inner-box">
			<div class="input auto-save">
				<label for="savePath">同步路径 :</label>
				<div class="sync-box" :class="{'green':value}">
					<input
						id="savePath"
						type="text"
						:value="syncPath"
						placeholder="选择自动同步路径"
						disabled
						:title="syncPath"
					/>
					<i class="el-icon-folder" @click="clickInput"></i>
				</div>
			</div>

			<div class="input auto-save" v-show="syncPath">
				<label for="savePath">自动同步 :</label>
				<el-switch v-model="value" active-color="#13ce66"></el-switch>
			</div>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = window.require('electron')

export default {
	mounted() {
		ipcRenderer.send('getSetting')

		ipcRenderer.on('syncPath', (event, args) => {
			this.$store.state.syncPath = args
		})

		ipcRenderer.on('auto', (event, args) => {
			this.value = args
		})
	},
	data() {
		return {
			value: false
		}
	},
	methods: {
		clickInput: function() {
			ipcRenderer.send('selectDir')
		},
		autoUpdate: function(val) {
			ipcRenderer.send('autoUpdate', val)
		}
	},
	computed: {
		syncPath() {
			return this.$store.state.syncPath
		}
	},
	watch: {
		value: function(val) {
			this.autoUpdate(val)
		}
	}
}
</script>

<style lang="scss" scoped>
.green {
	transition: 0.2s;
	box-shadow: 0 0 5px rgb(147, 224, 96);
	border: 1px solid rgb(147, 224, 96) !important;
}

.setting-container {
	width: 100%;
	height: 100%;
	overflow: scroll;
	&::-webkit-scrollbar {
		display: none;
	}

	label {
		display: block;
	}

	.input {
		margin: 20px 0;
	}

	.inner-box {
		width: 50%;
		margin: 0 auto;
		padding: 20px 0;
		color: rgb(97, 97, 97);

		label {
			padding-bottom: 20px;
			font-size: 30px;
		}

		.sync-box {
			border: 1px solid rgb(97, 97, 97);
			//position: absolute;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			padding: 10px;
			font-size: 20px;
			border-radius: 15px;
			background-color: rgba(241, 241, 241, 0.452);

			input {
				border: none;
				outline: none;
				padding: 0;
				width: 100%;
				background-color: transparent;
				font-size: 20px;
				color: rgb(151, 151, 151);
			}

			i {
				transition: 0.2s;
				cursor: pointer;

				&:hover {
					color: rgb(81, 178, 235);
				}
			}
		}
	}
}
</style>