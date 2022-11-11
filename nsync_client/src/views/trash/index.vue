<template>
	<div class="container" v-loading="loading">
		<div class="btn">
			<el-button size="medium" :disabled="item_count==0" @click="recover">恢复</el-button>
			<el-button size="medium" :disabled="item_count==0" @click="crush">粉碎</el-button>
		</div>

		<div class="file-info">
			<ns-checkbox @click.native="selectAll" ref="selectAll" v-show="fileItem!=''?true:false"></ns-checkbox>
			<div class="filename">文件名</div>
			<div class="info">
				<div class="size">大小</div>
				<div class="time">删除时间</div>
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
					@dblclick="preView(item.type)"
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
								@click.stop="preView(item.type)"
							>{{item.name}}</div>
							<div class="fun-ico">
								<i class="el-icon-refresh-left" @click.stop="recovery()"></i>
								<i class="el-icon-delete" @click.stop="smash()"></i>
							</div>
						</div>
					</div>
					<div class="info">
						<div class="size">{{item.size | byteFilter}}</div>
						<div class="time">{{item.time | timeFilter}}</div>
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
import renderList from '@/api/renderList.js'

export default {
	components: {
		NsCheckbox,
		NoFile
	},
	mounted() {
		this.getList(
			'/api/list',
			this.$store.getters.getUser + '/recycle' + '/'
		)
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
		recover: function() {
			let params = new FormData()

			for (let i in this.select_item) {
				params.append('filename', this.select_item[i].name)
			}

			this.$axios.post('/api/recover', params).then(res => {
				this.getList(
					'/api/list',
					this.$store.getters.getUser + '/recycle' + '/'
				)
			})
		},
		crush: function() {
			let params = new FormData()

			for (let i in this.select_item) {
				params.append('filename', this.select_item[i].name)
			}

			this.$axios.post('/api/crush', params).then(res => {
				this.getList(
					'/api/list',
					this.$store.getters.getUser + '/recycle' + '/'
				)
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

<style <style lang="scss" scoped>
@import '@/styles/filelist';
</style>