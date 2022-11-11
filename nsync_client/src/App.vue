<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
export default {
	name: 'App',
	data() {
		return {
			socket: null,
			ipcRenderer: null
		}
	},
	mounted() {
		//初始化用户信息
		this.$axios({
			methods: 'post',
			url: '/api/login',
			headers: { Authorization: localStorage.getItem('token') }
		})
			.then(e => {
				this.$store.state.usage_disk = e.data.usage_disk
				this.$store.state.total_disk = e.data.total_disk
			})
			.catch(e => {
				localStorage.removeItem('token')
				this.$router.push('/')
			})

		//初始化监视器
		let version = this.getVersion()
		this.$store.state.version = version
		if (version == 'electron') {
			const { ipcRenderer } = window.require('electron')
			this.ipcRenderer = ipcRenderer

			if (localStorage.getItem('token')) {
				this.ipcRenderer.send('initWatch', this.$store.state.user)
			}

			this.$EventBus.$on('initWatch', () => {
				this.ipcRenderer.send('initWatch', this.$store.state.user)
			})
		}

		//开启websocket
		if (localStorage.getItem('token')) {
			this.start()
		}
		this.$EventBus.$on('start', () => {
			this.start()
		})
	},
	methods: {
		start: function() {
			this.$EventBus.$on('transportSocketId', data => {
				//请求目标强制下线
				this.socket.emit('askOffline', data)
			})
			// console.log(navigator)

			this.socket = this.$io('http://iwen.live:9001', {
				transportOptions: {
					polling: {
						extraHeaders: {
							appname: navigator.appName,
							platform: navigator.platform,
							useragent: this.getVersion()
						}
					}
				}
			})

			this.socket.on('connect', () => {
				////////  sync file event ///////////////
				if (this.$store.state.version == 'electron') {
					this.socket.on('sync-delete', data => {
						// console.log(data)
						this.ipcRenderer.send('sync-delete', data)
						// return filename
					})

					this.socket.on('sync-download', data => {
						// console.log(data)
						this.ipcRenderer.send('sync-download', data)
						// return url
					})
				}

				this.socket.on('sync-list', () => {
					this.$EventBus.$emit('sync-list')
				})

				////////////// socket info event  ////////////////
				this.socket.on('info', data => {
					//获取连接信息
					let arr = []
					Object.keys(data).map(key => {
						arr.push(data[key])
					})
					this.$store.state.deviceLsit = arr

					// console.log(data)
				})

				this.socket.on('offline', () => {
					//强制下线
					localStorage.removeItem('token')
					this.$router.push('/login')
					this.socket.close()
				})
			})
		},

		getVersion: function() {
			let useragent = ''
			if (navigator.userAgent.toLowerCase().indexOf('electron') > -1)
				useragent = 'electron'
			else
				useragent = /ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(
					navigator.userAgent.toLowerCase()
				)
					? 'phone'
					: 'web'

			return useragent
		}
	}
}
</script>

<style lang="scss">
#app {
	// min-width: 1300px;
	// min-height: 600px;
	position: relative;
}
</style>

