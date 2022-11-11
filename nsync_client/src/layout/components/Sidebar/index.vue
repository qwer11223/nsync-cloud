<template>
	<el-row class="tac">
		<el-col :span="24">
			<el-menu
				default-active="2"
				class="el-menu-vertical-demo"
				@open="handleOpen"
				@close="handleClose"
				router
			>
				<el-menu-item index="myfile">
					<i class="el-icon-folder"></i>
					<span slot="title">我的文件</span>
				</el-menu-item>
				<el-menu-item index="trash">
					<i class="el-icon-delete"></i>
					<span slot="title">回收站</span>
				</el-menu-item>
				<el-menu-item index="share">
					<i class="el-icon-share"></i>
					<span slot="title">文件共享</span>
				</el-menu-item>
				<el-menu-item index="device">
					<i class="el-icon-mobile-phone"></i>
					<span slot="title">在线设备</span>
				</el-menu-item>
				<el-menu-item index="setting" v-show="$store.state.version=='electron'">
					<i class="el-icon-setting"></i>
					<span slot="title">同步设置</span>
				</el-menu-item>
			</el-menu>
		</el-col>
	</el-row>
</template>

<script>
export default {
	name: 'Sidebar',
	methods: {
		handleOpen(key, keyPath) {
			console.log(key, keyPath)
		},
		handleClose(key, keyPath) {
			console.log(key, keyPath)
		}
	}
}
</script>

<style>
</style>