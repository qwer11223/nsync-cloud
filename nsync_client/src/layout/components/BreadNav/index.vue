<template>
	<el-breadcrumb separator="/">
		<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
		<el-breadcrumb-item>{{path}}</el-breadcrumb-item>
		<el-breadcrumb-item v-for="(item,index) in querys" :key="index">{{item}}</el-breadcrumb-item>
	</el-breadcrumb>
</template>

<script>
export default {
	name: 'BreadNav',
	mounted() {
		this.path = this.$route.meta.title
	},
	data() {
		return {
			path: null,
			querys: []
		}
	},
	watch: {
		$route: function() {
			this.path = this.$route.meta.title

			if (Object.keys(this.$route.query) != '') {
				let query = Object.keys(this.$route.query)
				this.querys = [...query[0].split('/')]
				this.querys.shift()
			} else this.querys = []
		}
	}
}
</script>
