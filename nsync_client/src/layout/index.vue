<template>
	<div class="app-wrapper" @dragenter.prevent="showMask()">
		<div class="main">
			<div class="sidebar">
				<div class="logo"></div>
				<sidebar></sidebar>
				<div class="stroage">
					<el-progress
						type="circle"
						:percentage="parseInt(($store.state.usage_disk/$store.state.total_disk*100).toFixed(1))"
					></el-progress>
					<div class="storage_text">
						<p class="used">已用: {{$store.state.usage_disk | byteFilter}}</p>
						<p class="total">共计: {{$store.state.total_disk | byteFilter}}</p>
					</div>
				</div>
			</div>

			<div class="app-container">
				<div class="header">
					<div class="title">{{title}}</div>
					<div class="head_right">
						<div class="search">
							<i class="el-icon-search"></i>
							<input type="text" @keyup="remoteSearch($event)" />
						</div>

						<el-dropdown @command="handleCommand">
							<span class="el-dropdown-link">
								{{user.name}}
								<i class="el-icon-arrow-down el-icon--right"></i>
							</span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item icon="el-icon-receiving" command="logout">退出登录</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</div>
				</div>

				<div class="tags-view">
					<bread-nav></bread-nav>
				</div>

				<div class="app-main">
					<transition mode="out-in" name="page">
						<router-view></router-view>
					</transition>
				</div>
			</div>
		</div>

		<div class="bottom-status">
			<transition name="upload">
				<div class="upload-box" v-show="$store.state.showUploadList">
					<div class="upload-top">
						<div class="title-box">
							<div
								:class="{'title-active':!uploadTab}"
								class="top-title"
								@click="uploadTab=!uploadTab"
							>正在上传 ({{upLoadList.length}})</div>
							<div
								:class="{'title-active':uploadTab}"
								class="top-title"
								@click="uploadTab=!uploadTab"
							>上传成功 ({{successUpload.length}})</div>
						</div>
						<div class="top-btn">
							<i class="el-icon-close" @click="$store.commit('toggleUploadList')"></i>
						</div>
					</div>

					<!-- 上传列表 -->
					<ul class="upload-list" v-show="!uploadTab">
						<li v-for="(item,index) in upLoadList" :key="index">
							<div class="li-info">
								<div id="li-name">
									<i class="el-icon-upload2"></i>
									{{item.name}}
								</div>
								<div id="li-size">大小 {{item.size | byteFilter}}</div>
							</div>
							<div class="li-state">
								<div id="li-prg">{{item.progress}} %</div>
								<div id="li-barbg">
									<div id="li-bar" :style="{width:`${item.progress}%`}"></div>
								</div>
								<div id="li-chunk">{{item.currentChunk}}/{{item.chunkTotal}}</div>
							</div>

							<i class="el-icon-circle-close cancel" @click="cancelUpload(item,index)"></i>
						</li>
					</ul>

					<!-- 上传成功列表 -->
					<ul class="upload-list" v-show="uploadTab">
						<li v-for="(item,index) in successUpload" :key="index">
							<div class="li-info">
								<div id="li-name">
									<i class="el-icon-upload2"></i>
									{{item.name}}
								</div>
								<div id="li-size">大小 {{item.size | byteFilter}}</div>
							</div>
							<div class="li-state">
								<div id="li-prg">{{item.progress}} %</div>
								<div id="li-barbg">
									<div id="li-barr" :style="{width:`${item.progress}%`}"></div>
								</div>
								<div id="li-chunk">{{item.currentChunk}}/{{item.chunkTotal}}</div>
							</div>

							<i class="el-icon-circle-close cancel" @click="cancelUpload(item,index)"></i>
						</li>
					</ul>
				</div>
			</transition>

			<div class="status-path">
				<i class="el-icon-folder-opened margin-right-5"></i>
				<span class="path">{{$store.state.syncPath == ''?'未开启自动同步':$store.state.syncPath}}</span>
			</div>

			<i class="el-icon-upload up-btn" @click="$store.commit('toggleUploadList')">传输列表</i>
		</div>

		<div
			:class="{'mask-top':dragMask}"
			@drop.prevent="drop($event)"
			@dragleave.prevent="dragLeave"
			@dragover.prevent
		></div>
		<div :class="{'drag-mask':dragMask}">
			<div class="tip">在此处释放以上传到当前目录</div>
		</div>
	</div>
</template>

<script>
import { Sidebar, BreadNav } from './components'
import upload from '@/api/upload.js'
import renderList from '@/api/renderList.js'

export default {
	components: {
		Sidebar,
		BreadNav
	},
	mounted() {
		if (this.$store.state.version == 'electron') {
			const { ipcRenderer } = window.require('electron')
			this.ipcRenderer = ipcRenderer

			this.ipcRenderer.on('read-file', (e, data, fileName) => {
				let file = new File([data], fileName)
				this.upload([file])
			})
		}
	},
	data() {
		return {
			title: '我的文件',
			user: {
				name: 'admin'
			},
			storage: {
				used: '25GB',
				total: '100GB'
			},
			status: {
				path: ''
			},
			dragMask: 0,
			uploadTab: 0,
			cancel: null, //axios 请求取消
			ipcRenderer: null
		}
	},
	methods: {
		getList: function(_url, _path) {
			///////////渲染目录////////////
			renderList.render(_url, { path: _path }, res => {
				let filtype = ['folder']
				for (let i = 0; i < res.length; i++)
					if (!filtype.includes(res[i].type)) res[i].type = 'unknow'
				this.$store.state.fileList = [...res]
			})
		},
		showMask: function() {
			if (this.$route.path == '/myfile') this.dragMask = 1
		},
		drop: function(e) {
			var files = []
			;[].forEach.call(
				e.dataTransfer.files,
				function(file) {
					files.push(file)
				},
				false
			)
			this.upload(files)

			this.dragMask = 0
		},
		dragLeave: function() {
			this.dragMask = 0
		},
		handleCommand(command) {
			localStorage.removeItem('token')
			this.$router.push('/login')
		},
		cancelUpload: function(item, index) {
			console.log(item)
		},
		remoteSearch: function(e) {
			if (e.target.value === '') {
				let user = this.$store.getters.getUser //从vuex获取用户名
				let _path =
					user +
					'/root' +
					Object.keys(this.$route.query).toString() +
					'/' //拼接文件夹路径 例‘/admin /.../’
				this.getList('/api/list', _path)
				return 0
			}
			if (typeof this.cancel == 'function') this.cancel('cancel')
			let query = new FormData()
			query.append('k', e.target.value)
			this.$axios
				.post(`/api/search`, query, {
					cancelToken: new this.$axios.CancelToken(c => {
						this.cancel = c
					})
				})
				.then(res => {
					this.$store.state.fileList = [...res.data]
				})
				.catch(err => {
					if (this.$axios.isCancel(err)) console.log(err.message)
					else console.log(err)
				})
			// console.log(e.target.value)
		},
		upload: function(files) {
			upload.uploadFile(files, this.$route).then(res => {
				let user = this.$store.getters.getUser //从vuex获取用户名
				let _path =
					user +
					'/root' +
					Object.keys(this.$route.query).toString() +
					'/' //拼接文件夹路径 例‘/admin /.../’
				this.getList('/api/list', _path)
			})
		}
	},
	watch: {
		'$route.path': function(to, from) {
			this.title = this.$route.meta.title
			document.title = 'nsync - ' + this.$route.meta.title
		}
	},
	computed: {
		upLoadList: function() {
			return this.$store.getters.getUploadList.filter(item => {
				return item.state === 'pending'
			})
		},
		successUpload: function() {
			return this.$store.getters.getUploadList.filter(item => {
				return item.state === 'success'
			})
		}
	}
}
</script>

<style lang="scss">
@import '@/styles/common';

$sidebar_width: 200px;
$status_height: 25px;
$logo_height: 80px;
$tags_height: 30px;
$logo_src: '../assets/nsync_png.png';

.upload-enter-active,
.upload-leave-active {
	transition: all 0.6s ease;
}
.upload-enter,
.upload-leave-to {
	opacity: 0;
	width: 0px !important;
	height: 0px !important;
}

.page-enter-active,
.page-leave-active {
	transition: all 0.3s ease;
}
.page-enter {
	top: 600px !important;
}
.page-enter-to {
	top: 0 !important;
}

.page-leave-to {
	opacity: 0;
}

.title-active {
	background-color: #fff;
	color: #000;
}

.mask-top {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 999;
}

.drag-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(177, 177, 177, 0.376);
	z-index: 998;
	display: flex;
	justify-content: center;
	align-items: center;

	.tip {
		width: 90vw;
		height: 90vh;
		line-height: 90vh;
		border: 10px dashed rgb(151, 151, 151);
		font-size: 50px;
		text-align: center;
		color: rgb(151, 151, 151);
	}
}

.app-wrapper {
	width: 100%;
	height: 100%;

	.main {
		width: inherit;
		height: calc(100% - #{$status_height});
		position: absolute;

		.sidebar {
			width: $sidebar_width;
			height: 100%;
			background-color: rgb(255, 255, 255);
			position: absolute;
			box-shadow: 2px 0 15px rgb(182, 182, 182);
			z-index: 99;

			.logo {
				width: inherit;
				height: $logo_height;
				background: url($logo_src) no-repeat center center;
				background-size: 70%;
				//border: 1px solid #f00;
			}

			.stroage {
				width: inherit;
				height: 100px;
				position: absolute;
				display: flex;
				justify-content: space-between;
				padding: 10px;
				bottom: 0;
				box-sizing: border-box;
				border-top: 1px solid rgb(226, 226, 226);

				.el-progress-circle {
					height: 75px !important;
					width: 75px !important;
				}

				.storage_text p {
					margin: 10px 0;
				}
			}
		}

		.app-container {
			width: calc(100% - #{$sidebar_width});
			height: 100%;
			background-color: rgb(211, 241, 243);
			margin-left: $sidebar_width;
			position: relative;
			//overflow: hidden;

			.header {
				height: $logo_height;
				//border: 1px solid #f00;

				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 20px;

				.title {
					font-size: 25px;
				}

				.head_right {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 350px;
					margin: 0 30px;

					.search {
						display: flex;
						justify-content: center;
						align-items: center;
						padding: 8px 15px;
						background-color: #fff;
						border-radius: 100px;
						color: rgb(195, 195, 195);

						input {
							outline: none;
							background-color: transparent;
							border: none;
							margin-left: 10px;
						}
					}

					.el-dropdown-link {
						cursor: pointer;
						color: #202020;
						font-size: 16px;
						font-weight: 700;
					}
					.el-icon-arrow-down {
						font-size: 12px;
					}
				}
			}

			.tags-view {
				display: flex;
				justify-content: space-between;
				// align-items: center;
				box-sizing: border-box;
				position: absolute;
				width: 100%;
				height: $tags_height;
				padding: 0 20px;
				//border: 1px solid #f00;
			}

			.app-main {
				position: absolute;
				width: calc(100% - 80px);
				height: calc(100vh - 120px);
				left: 50%;
				transform: translate(-50%, #{$tags_height});
				overflow: hidden;
				padding-bottom: 20px;
				border-radius: 10px;
				// background-color: rgba(255, 255, 255, 0.726);
				//border: 1px solid #f00;
			}
		}
	}

	.bottom-status {
		width: 100%;
		height: $status_height;
		line-height: $status_height;
		color: #fff;
		font-size: 12px;
		padding: 0 10px;
		background-color: rgb(71, 75, 117);
		position: absolute;
		bottom: 0;
		z-index: 100;

		.status-path {
			display: inline-block;
			margin-right: 10px;
		}

		.up-btn {
			border-left: 1px solid rgb(192, 192, 192);
			padding-left: 10px;
			transition: 0.2s;

			&:hover {
				color: rgb(60, 163, 231);
			}

			cursor: pointer;
		}

		.upload-box {
			width: 500px;
			height: 400px;
			position: absolute;
			bottom: $status_height;
			left: $sidebar_width;
			background-color: #fff;
			box-shadow: 0 0 10px rgb(141, 141, 141);
			border-radius: 10px 10px 0 0;

			.upload-top {
				background-color: cadetblue;
				height: 45px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 20px;
				font-size: 16px;

				.title-box {
					display: flex;
					align-items: center;
					height: inherit;

					.top-title {
						display: flex;
						align-items: center;
						padding: 0 10px;
						height: inherit;
						cursor: pointer;
						transition: 0.2s;
						overflow: hidden;

						&:hover {
							background-color: rgba(240, 240, 240, 0.137);
						}
					}
				}

				i {
					cursor: pointer;
				}
			}

			.upload-list {
				color: #000;
				padding: 0;
				margin: 0;
				list-style: none;
				box-sizing: border-box;
				height: 350px;
				overflow: scroll;

				&::-webkit-scrollbar {
					display: none;
				}

				li {
					position: relative;
					padding: 0 10px;
					border-bottom: 1px solid rgb(245, 245, 245);

					&:hover .cancel {
						display: block;
					}

					& > div {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}

					.li-info {
						#li-name {
							width: 70%;
						}

						#li-size {
							width: 20%;
						}
					}

					.li-state {
						#li-prg,
						#li-chunk {
							width: 10%;
						}

						#li-barbg {
							width: 70%;
							height: 15px;
							border-radius: 50px;
							background-color: rgb(206, 206, 206);
							position: relative;
							overflow: hidden;

							#li-bar {
								position: absolute;
								height: inherit;
								width: 0px;
								border-radius: inherit;
								background-color: rgb(81, 111, 250);
								background-image: repeating-linear-gradient(
									30deg,
									hsla(0, 0%, 100%, 0.1),
									hsla(0, 0%, 100%, 0.1) 15px,
									transparent 0,
									transparent 30px
								);
								animation: libar 5s linear infinite;
							}

							#li-barr {
								position: absolute;
								height: inherit;
								width: 0px;
								border-radius: inherit;
								background-color: rgb(22, 190, 22);
							}
						}
					}

					.cancel {
						display: block;
						position: absolute;
						right: 2%;
						top: 50%;
						transform: translateY(-50%);
						font-size: 15px;
						color: rgb(95, 95, 95);
						cursor: pointer;
						transition: 0.2;
						display: none;

						&:hover {
							color: rgb(38, 111, 228);
						}
					}
				}
			}
		}
	}
}

@keyframes libar {
	0% {
		background-position: 0 0;
	}
	100% {
		background-position: 365px 0;
	}
}
</style>