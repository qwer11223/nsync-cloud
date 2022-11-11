<template>
	<div class="container">
		<form @click.prevent>
			<p>login</p>
			<input type="text" placeholder="username" required ref="user" />
			<input type="password" placeholder="password" required ref="pwd" />
			<input type="submit" value="login" id="submit" @click="submit" />
		</form>
	</div>
</template>

<script>
export default {
	methods: {
		submit: function() {
			let user = this.$refs.user.value
			let pwd = this.$refs.pwd.value

			if (user && pwd) {
				var formData = new FormData()
				formData.append('user', user)
				formData.append('pwd', pwd)

				this.$axios
					.post('/api/login', formData)
					.then(e => {
						if (e.status == 200) {
							this.$store.state.usage_disk = e.data.usage_disk
							this.$store.state.total_disk = e.data.total_disk
							this.$EventBus.$emit('initWatch')
							this.$EventBus.$emit('start')
							localStorage.setItem('token', e.data.token)
							this.$router.push('/')
						}
					})
					.catch(() => {
						this.$message.error('用户名或密码错误！')
					})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
* {
	margin: 0;
	padding: 0;
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box;
}

html,
body,
.container {
	height: 100%;
	width: 100%;
}

.container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	background-image: linear-gradient(
		94.3deg,
		rgba(26, 33, 64, 1) 10.9%,
		rgba(81, 84, 115, 1) 87.1%
	);
	overflow: hidden;
}

.container::before {
	content: '';
	position: absolute;
	z-index: 2;
	width: 450px;
	height: 450px;
	top: 50%;
	left: 10%;
	transform: translate(-10%, -80%);
	background-color: #ffe53b;
	background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
	border-radius: 50%;
	box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
	animation: pulse 1.5s infinite;
}

.container::after {
	content: '';
	position: absolute;
	z-index: 2;
	width: 300px;
	height: 300px;
	top: 50%;
	left: 50%;
	transform: translate(10%, 20%);
	background-color: #fa8bff;
	background-image: linear-gradient(
		45deg,
		#fa8bff 0%,
		#2bd2ff 52%,
		#2bff88 90%
	);
	border-radius: 50%;
	box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
	animation: pulse 1.6s infinite;
}

@keyframes pulse {
	50% {
		box-shadow: 0 0 0 50px #ffffff00;
	}

	100% {
		box-shadow: 0 0 0 0 #ffffff00;
	}
}

form {
	position: relative;
	z-index: 3;
	width: 320px;
	background-color: #ffffff10;
	padding: 45px 30px;
	border-radius: 8px;
	box-shadow: 0 20px 40px #00000010;
	border: 1px solid #ffffff20;
	border-right: 1px solid #ffffff10;
	border-bottom: 1px solid #ffffff10;
	backdrop-filter: blur(20px);
}

form p {
	color: #fff;
	display: block;
	text-align: center;
	margin: 0 0 30px 0;
}

input {
	width: 100%;
	height: 50px;
	border-radius: 8px;
	background-color: transparent;
	outline: none;
	margin-bottom: 15px;
	padding-left: 15px;
	color: #fff;
	border: 1px solid #fff;
}

input::placeholder {
	color: #ffffff80;
}

#submit {
	width: 100%;
	height: 50px;
	border: 0;
	background-image: linear-gradient(
		to right,
		#02aab0 0%,
		#00cdac 51%,
		#02aab0 100%
	);
	background-size: 200% auto;
	cursor: pointer;
	transition: ease 0.4s;
}

#submit:hover {
	background-position: right center;
	text-decoration: none;
	color: #fff;
}
</style>