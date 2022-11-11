<template>
	<div class="container device">
		<div class="box" v-for="(item,index) in $store.getters.getDevice" :key="index">
			<div class="btn">
				<span @click="offline(item)">强制下线</span>
			</div>
			<i :class="getIco(item.useragent)" aria-hidden="true"></i>
			<span class="text">设备 : {{item.dev}}</span>
			<span class="text">IP : {{item.ip}}</span>
		</div>

		<!-- <el-dialog title="输入此用户的密码" :visible.sync="centerDialogVisible" width="30%" center>
			<el-input placeholder="请输入密码" v-model="input" show-password></el-input>
			<span slot="footer" class="dialog-footer">
				<el-button @click="centerDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>-->
	</div>
</template>

<script>
export default {
	data() {
		return {
			// centerDialogVisible: false,
			// input: ''
		}
	},
	methods: {
		offline: function(element) {
			this.$EventBus.$emit('transportSocketId', element.socketId)
		},
		getIco: function(item) {
			if (item == 'electron') return 'fa fa-desktop'
			if (item == 'phone') return 'fa fa-mobile'
			if (item == 'web') return 'fa fa-chrome'
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/styles/filelist';

.device {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	overflow: auto;
}

.box {
	&:hover {
		border: 2px solid rgba(91, 181, 233, 0.52);
		background-color: rgba(49, 49, 49, 0.096);
	}

	&:hover .btn span {
		display: block;
	}

	// border: 1px solid #000;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	width: 150px;
	height: 150px;
	margin: 0 30px;
	transition: 0.2s ease;

	i {
		font-size: 100px;
		color: rgb(149, 145, 145);
	}

	.btn {
		position: absolute;
		width: inherit;
		height: inherit;
		display: flex;
		align-items: center;
		justify-content: center;

		span {
			background-color: rgb(255, 86, 86);
			color: #fff;
			padding: 8px 15px;
			font-size: 14px;
			border-radius: 200px;
			cursor: pointer;
			display: none;
		}
	}
}
</style>