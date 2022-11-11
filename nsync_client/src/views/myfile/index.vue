<template>
	<div class="myfile-container" v-loading="loading">
		<div class="btn">
			<input type="file" multiple ref="fileRef" v-show="0" @change="uploadFile($event)" />
			<input type="file" webkitdirectory ref="folderRef" v-show="0" @change="uploadFile($event)" />
			<el-button size="medium" v-if="item_count==0" @click="$refs.fileRef.click()">上传</el-button>
			<el-button size="medium" v-if="item_count==0" @click="$refs.folderRef.click()">上传文件夹</el-button>
			<el-button size="medium" v-if="0">新建</el-button>
			<el-button size="medium" v-if="item_count!=0" @click="downLoad()">下载</el-button>
			<el-button size="medium" v-if="item_count!=0" @click="del()">删除</el-button>
			<el-button size="medium" v-if="item_count==1" @click="share()">分享</el-button>
			<el-button size="medium" v-if="0">预览</el-button>
			<el-button size="medium" v-if="0">更多</el-button>
		</div>

		<div class="file-info">
			<ns-checkbox @click.native="selectAll" ref="selectAll"></ns-checkbox>
			<div class="filename">文件名</div>
			<div class="info">
				<div class="size">大小</div>
				<div class="time">修改时间</div>
				<div class="view">
					<i class="el-icon-s-fold" @click="toggleView(1)"></i>
					<i class="el-icon-menu" @click="toggleView(0)"></i>
				</div>
			</div>
		</div>

		<no-file v-show="fileItem==''?true:false"></no-file>

		<div class="file-list">
			<ul :class="class_change?'list':'grid'">
				<li
					v-for="(item ,index) in fileItem"
					:key="index"
					class="li"
					:class="{bg:item.showBg==1}"
					@click="selectLi(index,item)"
					@click.right.prevent="showMenu($event)"
					@dblclick="preView(item)"
				>
					<div class="grid-box">
						<div class="inner-box">
							<ns-checkbox ref="check" class="checkbox"></ns-checkbox>
							<img :src="require('@/../public/type/'+item.type+'.png')" alt />
						</div>
						<div class="name-box">
							<div
								class="filename"
								:class="{'folder':item.type=='folder'}"
								@click.stop="preView(item)"
							>{{item.name}}</div>
							<div class="fun-ico">
								<i class="el-icon-download" @click.stop="downLoad()"></i>
								<i class="el-icon-share" @click.stop="share1()"></i>
								<i class="el-icon-more" @click.stop="more()"></i>
							</div>
						</div>
					</div>
					<div class="info">
						<div class="size">{{item.size | byteFilter}}</div>
						<div class="time">{{item.time | timeFilter}}</div>
						<div></div>
					</div>
				</li>
			</ul>
			<el-divider>共 {{item_total}} 项</el-divider>
		</div>
	</div>
</template>

<script>
import NsCheckbox from '@/components/NsCheckbox/CheckBox'
import NoFile from '@/components/NoFileView/index'
import upload from '@/api/upload.js'
import renderList from '@/api/renderList.js'

export default {
	components: {
		NsCheckbox,
		NoFile
	},
	mounted() {
		this.$EventBus.$on('sync-list', () => {
			this.getList(
				'/api/list',
				this.$store.getters.getUser + '/root' + '/'
			)
		})

		this.class_change = this.$store.state.layout

		this.$axios({
			methods: 'post',
			url: '/api/login',
			headers: { Authorization: localStorage.getItem('token') }
		}).then(e => {
			// this.$store.state.usage_disk = e.data.usage_disk
			// this.$store.state.total_disk = e.data.total_disk
			///////////初始化用户根目录////////////
			this.getList(
				'/api/list',
				this.$store.getters.getUser + '/root' + '/'
			)
		})
		// .catch(e => {
		// 	localStorage.removeItem('token')
		// 	this.$router.push('/')
		// })
	},
	data() {
		return {
			fileItem: [],
			select_item: [],
			item_total: 0,
			item_count: 0,
			class_change: 1, // list/grid view
			loading: false
		}
	},
	methods: {
		getList: function(_url, _path) {
			//设置加载中遮罩层
			this.loading = true

			///////////渲染目录////////////
			renderList.render(_url, { path: _path }, res => {
				let filtype = ['folder']
				for (let i = 0; i < res.length; i++)
					if (!filtype.includes(res[i].type)) res[i].type = 'unknow'
				this.fileItem = [...res]
				//console.log(this.fileItem)

				///////////计算文件总数//////////
				this.item_total = this.fileItem.length

				/////////设置文件项背景//////
				for (let i = 0; i < this.fileItem.length; i++) {
					this.$set(this.fileItem[i], 'showBg', 0)
					//console.log(this.fileItem[i].showBg)
				}

				//取消加载中遮罩层
				this.loading = false
			})
		},
		selectAll: function() {
			var check_len = this.$refs.check.length

			if (this.item_total == this.item_count) {
				this.select_item = []
				this.item_count = 0

				for (let i = 0; i < check_len; i++) {
					this.$refs.check[i].selected = false
					this.fileItem[i].showBg = 0
					//console.log(this.fileItem[i].showBg)
				}
			} else {
				this.select_item = []
				for (let i = 0; i < this.fileItem.length; i++)
					this.select_item.push(this.fileItem[i])

				this.item_count = this.item_total

				for (let i = 0; i < check_len; i++) {
					this.$refs.check[i].selected = true
					this.fileItem[i].showBg = 1
					//console.log(this.fileItem[i].showBg)
				}
			}

			console.log(this.select_item)
		},
		selectLi: function(index, item) {
			item.showBg = !item.showBg
			this.select(index, item)
			//console.log(index, item.showBg)
		},
		select: function(index, el) {
			if (this.select_item.includes(el)) {
				this.select_item.splice(this.select_item.indexOf(el), 1)
				this.item_count--
			} else {
				this.select_item.push(el)
				this.item_count++
			}

			this.$refs.check[index].selected = !this.$refs.check[index].selected

			console.log(this.select_item)
		},
		toggleView: function(a) {
			this.class_change = a
		},
		preView: function(item) {
			if (item.type == 'folder') {
				this.$router.push(
					this.$route.path +
						'?' +
						Object.keys(this.$route.query).toString() +
						'/' +
						item.name
				) //导航文件目录
				//console.log(this.$route)
			}
		},
		downLoad: function() {
			var args = this.select_item
			var params = new FormData()

			Object.keys(args).forEach(key => {
				params.append('path', args[key].path)
			})

			// this.$axios
			// 	.post('/api/download', params, { responseType: 'blob' })
			// 	.then(res => {
			// 		let url = window.URL.createObjectURL(new Blob([res.data]))
			// 		// 生成一个a标签
			// 		let link = document.createElement('a')
			// 		link.style.display = 'none'
			// 		link.href = url
			// 		link.download = decodeURIComponent(
			// 			res.headers['content-disposition'].match(
			// 				/filename=(.*)$/
			// 			)[1]
			// 		)
			// 		document.body.appendChild(link)
			// 		link.click()
			// 		document.body.removeChild(link)
			// 		window.URL.revokeObjectURL(url)
			// 	})

			this.$axios.post('/api/download', params).then(res => {
				if (this.$store.state.version == 'electron') {
					const { ipcRenderer } = window.require('electron')
					ipcRenderer.send('download', `http://iwen.link${res.data}`)
				} else {
					window.location.href = `http://iwen.link${res.data}`
				}
			})
		},
		del: function() {
			var args = this.select_item
			var params = new FormData()

			for (let i in args) {
				params.append('path', args[i].path)
			}

			this.$axios.post('./api/del', params).then(res => {
				this.getList(
					'./api/list',
					this.$store.getters.getUser +
						'/root' +
						Object.keys(this.$route.query).toString() +
						'/'
				)
			})
		},
		share: function() {
			var args = this.select_item
			var params = new FormData()
			var date = new Date().getTime()
			params.append('user', this.$store.getters.getUser) //用户
			params.append('code', date) //文件名hash编码
			params.append('name', args[0].name) //文件名
			params.append('src', args[0].path) //文件路径
			params.append('type', args[0].type) //文件类型
			params.append('expire_time', date + 60 * 60 * 120) //过期时间
			params.append('share_time', date) //分享时间
			params.append('size', args[0].size) //文件大小

			this.$axios.post('/api/shared', params).then(res => {
				console.log(res)
			})
		},
		more: function() {
			alert('click more')
		},
		showMenu: function() {
			alert('right')
		},
		uploadFile: function(e) {
			upload.uploadFile(e, this.$route).then(res => {
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
		item_count: function() {
			if (this.item_count === this.item_total)
				this.$refs.selectAll.selected = !this.$refs.selectAll.selected
			if (this.item_count != this.item_total)
				this.$refs.selectAll.selected = false
		},
		$route: function() {
			let user = this.$store.getters.getUser //从vuex获取用户名
			let _path =
				user + '/root' + Object.keys(this.$route.query).toString() + '/' //拼接文件夹路径 例‘/admin /.../’
			//console.log(_path)
			this.getList('/api/list', _path)
		},
		'$store.getters.getChange': function() {
			let user = this.$store.getters.getUser //从vuex获取用户名
			let _path =
				user + '/root' + Object.keys(this.$route.query).toString() + '/' //拼接文件夹路径 例‘/admin /.../’
			this.getList('/api/list', _path)
		},
		'$store.state.fileList': function() {
			this.fileItem = this.$store.getters.getFileList

			///////////计算文件总数//////////
			this.item_total = this.fileItem.length

			/////////设置文件项背景//////
			for (let i = 0; i < this.fileItem.length; i++) {
				this.$set(this.fileItem[i], 'showBg', 0)
				//console.log(this.fileItem[i].showBg)
			}
		}
	}
}
</script>


<style lang="scss" scoped>
ul,
li {
	padding: 0;
	margin: 0;
	list-style: none;
}

.bg {
	background-color: #dfeeff;
}

.fun-ico {
	display: none;
	position: absolute;
	right: 0;

	i {
		margin: 0 5px;
		color: #107ffc;
		font-size: 20px;
		cursor: pointer;
	}
}

.folder {
	transition: 0.2s;
	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
}

.el-divider--horizontal {
	width: 200px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);

	.el-divider__text.is-center {
		background-color: rgb(243 251 252);
	}
}

.info {
	display: flex;
	position: absolute;
	width: 40%;
	right: 50px;
	& > div {
		width: 50%;
	}

	.view {
		text-align: right;
		i {
			transition: 0.2s;
			cursor: pointer;
			margin: 0 5px;

			&:hover {
				color: rgb(115, 210, 248);
			}
		}
	}
}

.myfile-container {
	width: 100%;
	height: inherit;
	font-size: 15px;
	background-color: rgba(255, 255, 255, 0.726);
	border-radius: 10px;
	position: absolute;
	top: 0;

	.btn {
		padding: 10px 20px;

		.el-button--medium {
			padding: 10px 35px;
		}
	}

	.file-info {
		background-color: #f9f9f9;
		padding: 5px 10px;
		display: flex;
	}

	.file-list {
		padding: 5px 0;
		width: 100%;
		height: calc(100% - 90px);
		overflow: scroll;
		position: relative;

		&::-webkit-scrollbar {
			display: none;
		}

		.list {
			.li {
				position: relative;
				height: 50px;
				display: flex;
				align-items: center;
				border-bottom: 1px solid rgb(241, 241, 241);
				transition: 0.1s;
				padding: 0 10px;

				&:hover {
					background-color: #cecece42;
				}
				&:hover .fun-ico {
					display: block;
				}

				.grid-box {
					display: flex;
					align-items: center;
					position: relative;
					width: 50%;

					.inner-box {
						display: flex;

						img {
							width: 35px;
							height: 35px;
							margin-right: 15px;
							margin-left: 2px;
						}
					}

					.name-box {
						display: flex;
						width: 100%;
						justify-content: space-between;
					}
				}
			}
		}
	}
}
.grid {
	display: flex;
	flex-wrap: wrap;

	.li {
		width: 150px;
		//height: 150px;
		transition: 0.2s;

		.grid-box {
			margin: 10% 10% 15% 10%;
			text-align: center;

			.inner-box {
				border: 1px solid rgb(216, 216, 216);
				box-sizing: border-box;
				padding: 20px;
				position: relative;
				transition: 0.2s;
				cursor: pointer;

				&:hover {
					background-color: rgba(95, 184, 236, 0.267);
				}

				.checkbox {
					position: absolute;
					margin: 0;
					top: 5px;
					left: 5px;
				}

				img {
					height: 100%;
					width: 100%;
				}
			}

			.filename {
				margin: 5px 0;
			}
		}

		.info,
		.fun-ico {
			display: none;
		}
	}
}
</style>