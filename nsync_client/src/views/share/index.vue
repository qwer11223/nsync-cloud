<template>
	<div class="container" v-loading="loading">
		<div class="btn">
			<el-button size="medium" :disabled="item_count==0" @click="unShare">取消分享</el-button>
		</div>

		<div class="file-info">
			<ns-checkbox @click.native="selectAll" ref="selectAll" v-show="fileItem!=''?true:false"></ns-checkbox>
			<div class="filename">文件名</div>
			<div class="info">
				<div class="size">过期时间</div>
				<div class="time">分享时间</div>
			</div>
		</div>

		<no-file v-show="fileItem==''?true:false"></no-file>

		<div class="file-list">
			<ul class="list">
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
								class="filename itemname"
								:class="{'folder':item.type=='folder'}"
								@click.stop="preView(item)"
							>{{item.name}}</div>
							<div class="fun-ico">
								<i class="el-icon-link" @click.stop="unlink()"></i>
							</div>
						</div>
					</div>
					<div class="info">
						<div class="size">{{item.expire_time | timeFilter}}</div>
						<div class="time">{{item.share_time | timeFilter}}</div>
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

export default {
	components: {
		NsCheckbox,
		NoFile
	},
	mounted() {
		this.loading = true

		this.$axios.get('/api/readshared').then(res => {
			this.fileItem = res.data.shared

			this.item_total = this.fileItem.length

			for (let i = 0; i < this.fileItem.length; i++) {
				this.$set(this.fileItem[i], 'showBg', 0)
				//console.log(this.fileItem[i].showBg)
			}
			//console.log(this.fileItem)

			this.loading = false
		})
	},
	data() {
		return {
			fileItem: [],
			select_item: [],
			item_total: 0,
			item_count: 0,
			loading: false
		}
	},
	methods: {
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
		selectLi: function(index, item) {
			item.showBg = !item.showBg
			this.select(index, item)
			//console.log(index, item.showBg)
		},
		preView: function(item) {
			// let routeData = this.$router.resolve({
			// 	path: 'http://localhost:8080/share.html',
			// 	query: { u: item.user, s: item.code }
			// })
			if (this.$store.state.version == 'electron') {
				const { shell } = window.require('electron')
				shell.openExternal(
					`http://iwen.link/dist/share.html#/?u=${item.user}&s=${item.code}`
				)
			} else
				window.open(
					`share.html#/?u=${item.user}&s=${item.code}`,
					'_blank'
				)
		},
		unShare: function() {
			var args = this.select_item
			var params = new FormData()

			Object.keys(args).forEach(key => {
				params.append('code', args[key].code)
			})

			this.$axios.post('/api/unshared', params).then(res => {
				if (res.status === 200) {
					this.$axios.get('/api/readshared').then(res => {
						this.fileItem = res.data.shared

						this.item_total = this.fileItem.length

						for (let i = 0; i < this.fileItem.length; i++) {
							this.$set(this.fileItem[i], 'showBg', 0)
							//console.log(this.fileItem[i].showBg)
						}
						//console.log(this.fileItem)

						this.loading = false
					})
				}
			})
		}
	},
	watch: {
		item_count: function() {
			if (this.item_count === this.item_total)
				this.$refs.selectAll.selected = !this.$refs.selectAll.selected
			if (this.item_count != this.item_total)
				this.$refs.selectAll.selected = false
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/styles/filelist';

.itemname {
	cursor: pointer;
}
</style>