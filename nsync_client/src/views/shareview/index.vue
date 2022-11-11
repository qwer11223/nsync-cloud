<template>
	<div class="container">
		<div class="top">
			<img src="@/assets/nsync_png.png" alt />
			<span>{{info.user}} 的分享</span>
		</div>
		<div class="box">
			<div class="view">
				<div class="info-top">
					<div class="name">
						<i class="el-icon-document"></i>
						{{info.name}}
					</div>
					<div class="btn">
						<el-button size="medium" @click="download">下载 ({{info.size | byteFilter}})</el-button>
					</div>
				</div>
				<div class="info-mid">
					<i class="el-icon-time"></i>
					{{info.share_time | timeFilter}} 过期时间: {{info.expire_time | timeFilter}}
				</div>
				<div class="info-bot">
					<div class="lay">
						<div class="pic">
							<img :src="require('@/../public/type/'+info.type+'.png')" alt />
						</div>
						<div class="size">大小: {{info.size | byteFilter}}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	mounted() {
		this.$axios.post('/api/getshared', this.$route.query).then(res => {
			this.info = res.data
			// console.log(res)
		})
	},
	data() {
		return {
			info: {}
		}
	},
	methods: {
		download: function() {
			var params = new FormData()

			params.append('path', this.info.src)

			this.$axios
				.post('/api/download', params, { responseType: 'blob' })
				.then(res => {
					let url = window.URL.createObjectURL(new Blob([res.data]))
					// 生成一个a标签
					let link = document.createElement('a')
					link.style.display = 'none'
					link.href = url
					link.download = decodeURIComponent(
						res.headers['content-disposition'].match(
							/filename=(.*)$/
						)[1]
					)
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)
					window.URL.revokeObjectURL(url)
				})
		}
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
}

html,
body,
.container {
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
}

.top {
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
	padding: 10px 25px;
	box-shadow: 1px 0 10px rgb(177, 177, 177);

	img {
		height: 40px;
	}
}

.box {
	background-color: #f7f7f7;
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 99;
	display: flex;
	justify-content: space-around;

	.view {
		background-color: #fff;
		width: 45%;
		height: 60%;
		border-radius: 10px;
		margin-top: 30px;
		box-shadow: 3px 3px 5px rgb(195, 195, 195);
		padding: 5px;

		.info-top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 5px;
			padding: 10px 10px 3px 10px;

			.name {
				font-size: 18px;
			}
		}

		.info-mid {
			border-bottom: 1px solid rgb(236, 236, 236);
			font-size: 12px;
			color: #666666;
			padding: 0 10px 10px;
		}

		.info-bot {
			display: flex;
			justify-content: space-around;
			align-items: center;
			height: 80%;

			.pic {
				width: 100px;
				height: 100px;
				border: 1px solid rgb(204, 204, 204);
				border-radius: 10px;
				padding: 20px;

				img {
					width: 100%;
					height: 100%;
				}
			}

			.size {
				text-align: center;
				font-size: 14px;
				margin-top: 10px;
				color: rgb(53, 53, 53);
			}
		}
	}
}
</style>